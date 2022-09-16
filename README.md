# Steampipe GitHub Action

Steampipe GitHub action is used for scanning infrastructure-as-code and other compliance checks in your GitHub workflow pipeline. By utilizing this GitHub action, you can automatically start to monitor your project for configuration errors in Terraform.

**Note** Currently it supports [AWS](https://hub.steampipe.io/mods/turbot/terraform_aws_compliance), [Azure](https://hub.steampipe.io/mods/turbot/terraform_azure_compliance), [GCP](https://hub.steampipe.io/mods/turbot/terraform_gcp_compliance) and [OCI](https://hub.steampipe.io/mods/turbot/terraform_oci_compliance) terraform configuration checks.

## How to use the Steampipe GitHub Action

It is very easy to start using the GitHub action.

All you need to do is:

1. Follow the instructions at [GitHub configuration a workflow](https://help.github.com/en/actions/configuring-and-managing-workflows/configuring-a-workflow) to enable GitHub Action in your repository.
2. Set up GitHub secrets (if required).
3. Follow the examples provided in `examples/workflow`, to start with `terraform_compliance.yml`.
4. The workflow `uses` the `turbot/steampipe-action/tfscan`.
5. Optionally, provide parameters to customize GitHub action behaviours.

## Usage Examples

### Scan IaC in your repository

```yaml
name: Run Steampipe Checks
on:
  push:
    branches:
      - main
  pull_request:
  workflow_dispatch:

jobs:
  steampipe-terraform-checks:
    runs-on: ubuntu-latest

    steps:
      - name: Check out repository
        uses: actions/checkout@v3

      - name: Steampipe terraform scan action
        continue-on-error: false
        uses: ./
        with:
          mod: 'https://github.com/turbot/steampipe-mod-terraform-aws-compliance.git'
```

## GitHub action Parameters

| Parameter  | Description | Required | Default | Type |
| -----------| -------------------------------------------------------------------------------------------------------- | ------------- | ------------- | ------------- |
| mod | Git URL of a mod that will be installed. This will be passed on to `git clone` | Yes | | Input parameters |
| export | Export output to a file. Supported export formats are asff, csv, html, json and md | No | | Input parameters |
| output | The console output format. Possible values are brief, csv, html, json, md, text or none. | No | text | Input parameters |
| run | A list of benchmarks and controls to run (comma-separated). If no value is specified, it runs `check all` | No | check all | Input parameters |
| version | The version number of Steampipe that will be installed | No | latest | Input parameters |
| where | Filter the list of controls to run, using a `sql` where clause against the `steampipe_control` reflection table | No | | Input parameters |

## Example Screenshots

Workflow with successful execution
![](images/successful_action.png)

Workflow with failed execution
![](images/failed_execution.png)

Workflow with summarized execution
![](images/workflow_summarized.png)
