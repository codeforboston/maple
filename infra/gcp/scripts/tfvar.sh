#!/usr/bin/env bash
# tfvar <env> <name>: the value of a string variable as Terraform will see it —
# envs/<env>.tfvars first, else the variable's default in variables.tf. Sourced
# by bootstrap.sh and secrets.sh; run from infra/gcp.
tfvar() {
  local v
  v=$(sed -n "s/^$2 *= *\"\\(.*\\)\".*/\\1/p" "envs/$1.tfvars")
  [ -n "$v" ] || v=$(sed -n "/^variable \"$2\" {/,/^}/s/^ *default *= *\"\\(.*\\)\".*/\\1/p" variables.tf)
  [ -n "$v" ] || { echo "tfvar: no value for $2 in envs/$1.tfvars or variables.tf" >&2; return 1; }
  printf %s "$v"
}
