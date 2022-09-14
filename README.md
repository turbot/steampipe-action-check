# Steampipe GitHub Action

This GitHub Action runs Steampipe against your cloud infrastructure. Use SQL to instantly query your cloud services (AWS, Azure, GCP and more). Open source CLI. No DB is required.

// TO DO More info

## How to use the Steampipe GitHub Action

It is very easy to start using the GitHub action.

All you need to do is:

1. Follow the instructions at [GitHub configuration a workflow](https://help.github.com/en/actions/configuring-and-managing-workflows/configuring-a-workflow) to enable Github Action in your repository.
2. (TO DO) Set up required secrets
3. (TO DO) In the app build job, uses the `turbot/steampipe-action`
4. Optionally, supply parameters to customize GitHub action behaviour

## Usage Examples

### Scan IaC in your repository

```yaml
name: Run Steampipe
on:
  push:
    branches:
      - first-setup
  workflow_dispatch:
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Check out repository
        uses: actions/checkout@v3
      - name: Use local my-action
        uses: ./
        with:
          version: 'latest'
          connection_config: |
            connection "terraform" {
              plugin = "terraform"
              paths = ${{ secrets.TF_PATH }}
            }
          plugins: "[\"terraform\"]"
          mod: 'https://github.com/turbot/steampipe-mod-terraform-aws-compliance.git'
```

## GitHub action Parameters

| Parameter  | Description | Required | Default | Type |
| -----------| -------------------------------------------------------------------------------------------------------- | ------------- | ------------- | ------------- |
| version | Version of Steampipe | No | Latest | Input parameter |
| plugins | A list of plugins to install and configure | Yes |  | Input parameter |
| modRepository | Git URL of a mod that will be installed. Will be passed on to `git clone` | Yes | | Input parameters |
| connection_config | Connection config that steampipe will be initialized with | Yes |  | Input parameters |
| control | Runs specific control | No |  | Input parameters |
| benchmark | Runs specific benchmark | No |  | Input parameters |
| output | Select a console output format: brief, csv, html, json, md, text or none | No | Table | Input parameters |
| export | Export output to files in various output formats: csv, html, json, md, nunit3 or asff (json) | No | | |
| where | SQL 'where' clause, or named query, used to filter controls (cannot be used with '--tag' | No | | Input parameters |
