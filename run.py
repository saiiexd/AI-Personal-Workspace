#!/usr/bin/env python3
import subprocess
import sys
import time
import shutil

def is_docker_running():
    """Check if the Docker daemon is running."""
    docker_cmd = shutil.which("docker")
    if not docker_cmd:
        return False
    try:
        # Run docker info to see if daemon is responsive (with 5s timeout to avoid hangs)
        result = subprocess.run([docker_cmd, "info"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, timeout=5)
        return result.returncode == 0
    except Exception:
        return False

def get_docker_compose_cmd():
    """Determine whether to use 'docker compose' or 'docker-compose'."""
    if shutil.which("docker-compose"):
        return ["docker-compose"]
    
    docker_cmd = shutil.which("docker")
    if docker_cmd:
        # Check if 'compose' is a valid plugin (with 5s timeout)
        try:
            result = subprocess.run([docker_cmd, "compose", "version"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, timeout=5)
            if result.returncode == 0:
                return [docker_cmd, "compose"]
        except Exception:
            pass
            
    return None

def main():
    print("Starting AI Personal Workspace...")
    
    if not is_docker_running():
        print("Error: Docker daemon is not running!")
        print("Please start Docker Desktop on your system and try again.")
        print("The system requires Docker for PostgreSQL (with pgvector) and Redis.")
        sys.exit(1)

    compose_cmd = get_docker_compose_cmd()
    if not compose_cmd:
        print("Error: Neither 'docker-compose' nor 'docker compose' was found in your PATH.")
        print("Please install Docker Compose and try again.")
        sys.exit(1)

    print("Building and starting containers...")
    up_cmd = compose_cmd + ["up", "-d", "--build"]
    try:
        subprocess.run(up_cmd, check=True)
    except subprocess.CalledProcessError as e:
        print(f"Failed to start containers: {e}")
        sys.exit(1)

    print("Waiting for database to be ready and running migrations...")
    migrate_cmd = compose_cmd + ["exec", "-T", "api", "alembic", "upgrade", "head"]
    
    # Retry running migrations as the DB container might take a few seconds to start up
    max_retries = 10
    success = False
    for i in range(max_retries):
        try:
            # Check if api service is ready to run alembic
            result = subprocess.run(migrate_cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
            if result.returncode == 0:
                print("Database migrations applied successfully.")
                success = True
                break
            else:
                if "relation" in result.stderr or "connection" in result.stderr or "does not exist" in result.stderr:
                    # Database might still be initializing
                    pass
        except Exception:
            pass
        
        print(f"   [{i+1}/{max_retries}] Database is starting up, retrying in 2 seconds...")
        time.sleep(2)

    if not success:
        print("Warning: Migrations could not be applied automatically.")
        print("Please run migrations manually once the services are online using: make migrate")
    
    print("\n" + "="*50)
    print("AI Personal Workspace is up and running!")
    print("="*50)
    print("Frontend Dashboard:  http://localhost:3000")
    print("Backend API Docs:    http://localhost:8000/docs")
    print("="*50)
    print("\nTo stop the system, run: docker compose down")

if __name__ == "__main__":
    main()
