#!/usr/bin/env bash

# Execute a Clerk Backend API request with scope enforcement.
#
# Usage: bash execute-request.sh [--admin] [--env-file FILE] <METHOD> <PATH> [BODY]
#
# Scope enforcement:
#   GET     — always allowed
#   POST, PUT, PATCH — requires CLERK_BAPI_SCOPES="write" or --admin flag
#   DELETE  — requires CLERK_BAPI_SCOPES="write,delete" or --admin flag

set -euo pipefail

ADMIN=false
ENV_FILE=""
USAGE='Usage: execute-request.sh [--admin] [--env-file FILE] <METHOD> <PATH> [BODY]'

# Parse options. Environment files are loaded only when explicitly provided.
while [[ "${1:-}" == --* ]]; do
  case "$1" in
    --admin)
      ADMIN=true
      shift
      ;;
    --env-file)
      [[ -n "${2:-}" ]] || { echo "ERROR: --env-file requires a path." >&2; exit 1; }
      ENV_FILE="$2"
      shift 2
      ;;
    *)
      echo "ERROR: Unknown option: $1" >&2
      echo "$USAGE" >&2
      exit 1
      ;;
  esac
done

load_env_file() {
  local env_file="$1" line key value line_number=0

  [[ -f "$env_file" ]] || { echo "ERROR: Environment file not found: $env_file" >&2; return 1; }

  while IFS= read -r line || [[ -n "$line" ]]; do
    ((line_number += 1))
    line="${line%$'\r'}"

    [[ "$line" =~ ^[[:space:]]*$ || "$line" =~ ^[[:space:]]*# ]] && continue
    if [[ ! "$line" =~ ^[[:space:]]*(export[[:space:]]+)?([a-zA-Z_][a-zA-Z0-9_]*)[[:space:]]*=(.*)$ ]]; then
      echo "ERROR: Invalid assignment in $env_file at line $line_number." >&2
      return 1
    fi

    key="${BASH_REMATCH[2]}"
    value="${BASH_REMATCH[3]}"
    value="${value#"${value%%[![:space:]]*}"}"
    value="${value%"${value##*[![:space:]]}"}"

    if [[ ${#value} -ge 2 ]]; then
      if [[ "${value:0:1}" == "'" && "${value: -1}" == "'" ]] ||
         [[ "${value:0:1}" == '"' && "${value: -1}" == '"' ]]; then
        value="${value:1:${#value}-2}"
      fi
    fi

    printf -v "$key" '%s' "$value"
    export "$key"
  done < "$env_file"
}

if [[ -n "$ENV_FILE" ]]; then
  load_env_file "$ENV_FILE"
fi

METHOD="${1:?$USAGE}"
PATH_ARG="${2:?$USAGE}"
BODY="${3:-}"

METHOD_UPPER=$(echo "$METHOD" | tr '[:lower:]' '[:upper:]')
SCOPES="${CLERK_BAPI_SCOPES:-}"
HAS_WRITE_SCOPE=false
HAS_DELETE_SCOPE=false

IFS=',' read -r -a SCOPE_TOKENS <<< "$SCOPES"
for scope in "${SCOPE_TOKENS[@]}"; do
  scope="${scope#"${scope%%[![:space:]]*}"}"
  scope="${scope%"${scope##*[![:space:]]}"}"
  scope="${scope,,}"

  case "$scope" in
    write) HAS_WRITE_SCOPE=true ;;
    delete) HAS_DELETE_SCOPE=true ;;
  esac
done
unset scope SCOPE_TOKENS

# Scope check
if [[ "$ADMIN" == false ]]; then
  case "$METHOD_UPPER" in
      GET)
        ;; # always allowed
      POST|PUT|PATCH)
      if [[ "$HAS_WRITE_SCOPE" == false ]]; then
        echo "ERROR: $METHOD_UPPER requests require CLERK_BAPI_SCOPES=\"write\" or --admin flag." >&2
        echo "Current CLERK_BAPI_SCOPES: \"$SCOPES\"" >&2
        exit 1
      fi
      ;;
    DELETE)
      if [[ "$HAS_WRITE_SCOPE" == false || "$HAS_DELETE_SCOPE" == false ]]; then
        echo "ERROR: DELETE requests require CLERK_BAPI_SCOPES=\"write,delete\" or --admin flag." >&2
        echo "Current CLERK_BAPI_SCOPES: \"$SCOPES\"" >&2
        exit 1
      fi
      ;;
    *)
      echo "ERROR: Unknown HTTP method: $METHOD_UPPER" >&2
      exit 1
      ;;
  esac
fi

# Base URL: use CLERK_REST_API_URL if set, otherwise default to production
BASE_URL="${CLERK_REST_API_URL:-https://api.clerk.com}"

# Build curl command
CURL_ARGS=(
  -s
  -X "$METHOD_UPPER"
  "${BASE_URL}/v1${PATH_ARG}"
  -H "Authorization: Bearer ${CLERK_SECRET_KEY:?CLERK_SECRET_KEY is not set}"
  -H "Content-Type: application/json"
)

if [[ -n "$BODY" ]]; then
  CURL_ARGS+=(-d "$BODY")
fi

curl "${CURL_ARGS[@]}"
