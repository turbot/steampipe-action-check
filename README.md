# Steampipe GitHub Action

Steampipe GitHub action is used for scanning infrastructure-as-code & other compliance checks in your GitHub workflow pipeline. By utilizing this GitHub action in your project workflow, you can automatically start to find, fix and monitor your project for configuration errors in Terraform.

**Note** Currently it supports executing AWS, Azure and GCP terraform compliances.

## How to use the Steampipe GitHub Action

It is very easy to start using the GitHub action.

All you need to do is:

1. Follow the instructions at [GitHub configuration a workflow](https://help.github.com/en/actions/configuring-and-managing-workflows/configuring-a-workflow) to enable Github Action in your repository.
2. Set up GitHub secrets (if required)
3. Follow examples provided in `examples/workflow`
4. (TODO) In the workflow uses the `turbot/steampipe-action`
5. Optionally, supply parameters to customize GitHub action behaviors

## Usage Examples

### Scan IaC in your repository

```yaml
name: Run Steampipe Checks
on:
  push:
    branches:
      - main
  pull_request:

jobs:
  steampipe-terraform-checks:
    runs-on: ubuntu-latest

    steps:
      - name: Check out repository
        uses: actions/checkout@v3

      - name: Steampipe terraform scan action
        continue-on-error: true
        uses: ./
        with:
          version: 'latest'
          connection_config: |
            connection "terraform" {
              plugin = "terraform"
              paths = ["examples/terraform/aws/**/*.tf"]
            }
          plugins: terraform
          mod: 'https://github.com/turbot/steampipe-mod-terraform-aws-compliance.git'
          # run: control.ec2_instance_not_use_default_vpc, control.ec2_ebs_default_encryption_enabled
          output: text
```

## GitHub action Parameters

| Parameter  | Description | Required | Default | Type |
| -----------| -------------------------------------------------------------------------------------------------------- | ------------- | ------------- | ------------- |
| version | Version number of Steampipe that will be installed | No | latest | Input parameter |
| plugins | A list of plugins to install and configure. This can be set of comma-separated values | Yes |  | Input parameter |
| mod | Git URL of a mod that will be installed. This will be passed on to `git clone` | Yes | | Input parameters |
| connection_config | Connection config that steampipe will use | Yes |  | Input parameters |
| run | A list of benchmarks and controls to run (comma-separated). If no value specified, it runs  `check all` | No | check all | Input parameters |
| output | Select a console output format i.e. brief, csv, html, json, md, text or none | No | text | Input parameters |
| export | Export output to files in various output formats such as csv, html, json, md, nunit3 or asff (json) - comma separated | No | | |
| where | SQL 'where' clause, or named query, used to filter controls | No | | Input parameters |

## Example Screenshots

*(To be updated)*

Workflow with successful execution
![](images/successful_action.png)

Workflow with failed execution
![](images/failed_execution.png)

Workflow with summarized execution
![](images/workflow_summarized.png)
