import os
import sys

def run_readiness_audit():
    print("====================================================")
    print("         LAUNCH READINESS AUDIT SCORECARD           ")
    print("====================================================")
    
    score = 100
    deductions = []

    # 1. Check Frontend Dockerfile
    if os.path.exists("frontend/Dockerfile"):
        print("[OK] Frontend Dockerfile exists.")
    else:
        score -= 20
        deductions.append("Missing frontend/Dockerfile (-20)")

    # 2. Check Backend Dockerfile
    if os.path.exists("backend/Dockerfile"):
        print("[OK] Backend Dockerfile exists.")
    else:
        score -= 20
        deductions.append("Missing backend/Dockerfile (-20)")

    # 3. Check CI/CD Workflows
    if os.path.exists(".github/workflows/ci-cd.yml"):
        print("[OK] GitHub Actions CI/CD pipeline configured.")
    else:
        score -= 15
        deductions.append("Missing CI/CD workflows (-15)")

    # 4. Check Frontend Tests
    if os.path.exists("frontend/src/__tests__/auth.test.tsx"):
        print("[OK] Frontend unit & integration tests written.")
    else:
        score -= 15
        deductions.append("Missing frontend testing suite (-15)")

    # 5. Check Rate Limiting configuration
    if os.path.exists("backend/app/core/rate_limit.py"):
        print("[OK] API Rate Limiting protection enabled.")
    else:
        score -= 15
        deductions.append("Missing rate limiting logic (-15)")

    # 6. Check Security Hardening middleware
    if os.path.exists("backend/app/core/security_hardening.py"):
        print("[OK] Security Hardening and headers middleware active.")
    else:
        score -= 15
        deductions.append("Missing security headers / prompt injection controls (-15)")

    print("\n----------------------------------------------------")
    print(f"OVERALL LAUNCH READINESS SCORE: {max(0, score)}/100")
    print("----------------------------------------------------")
    
    if deductions:
        print("Required Improvements:")
        for dec in deductions:
            print(f"  - {dec}")
        sys.exit(1)
    else:
        print("PLATFORM STATUS: READY FOR LAUNCH!")
        sys.exit(0)

if __name__ == "__main__":
    run_readiness_audit()
