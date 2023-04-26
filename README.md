# Steampipe IaC Action

[![Maintained by Steampipe.io](https://img.shields.io/badge/maintained%20by-steampipe.io-c33)](https://steampipe.io/?utm_source=github&utm_medium=organic_oss&utm_campaign=polygoat) &nbsp;
[![AWS Terraform Compliance](https://img.shields.io/badge/terraform-AWS_Compliance-orange)](https://hub.steampipe.io/mods/turbot/terraform_aws_compliance) &nbsp;
[![Azure Terraform Compliance](https://img.shields.io/badge/terraform-Azure_Compliance-blue)](https://hub.steampipe.io/mods/turbot/terraform_azure_compliance) &nbsp;
[![GCP Terraform Compliance](https://img.shields.io/badge/terraform-GCP_Compliance-blue)](https://hub.steampipe.io/mods/turbot/terraform_gcp_compliance) &nbsp;
[![OCI Terraform Compliance](https://img.shields.io/badge/terraform-OCI_Compliance-red)](https://hub.steampipe.io/mods/turbot/terraform_oci_compliance) &nbsp;
![License](https://img.shields.io/badge/license-Apache-blue)  &nbsp;

## Integrate Steampipe IaC action into your GitHub workflows

The Steampipe IaC action enables scanning your Infrastructure as Code (IaC) configuration files directly from the repository using your GitHub workflow pipeline. This enables you to proactively identify potential security vulnerabilities, compliance issues, and infrastructure misconfigurations.

### Pre-requisite

Enable and [configure GitHub Action](https://help.github.com/en/actions/configuring-and-managing-workflows/configuring-a-workflow) in your repository.

## Getting started

To get started with scanning your AWS terraform resources, add this code into your GitHub actions workflow file.

```yaml
jobs:
  terraform-compliance:
    runs-on: ubuntu-latest
    steps:
      - name: Check out repository
        uses: actions/checkout@v3
      - name: Scan terraform aws resources
        uses: turbot/steampipe-iac-action
        with:
          mod_url: https://github.com/turbot/steampipe-mod-terraform-aws-compliance.git
```

This uses the `turbot/steampipe-iac-action` action and scans the terraform AWS resources in your repository.

You can adjust the **`mod_url`** parameter to perform a scan on Terraform resources available on the below supported cloud providers.

| Provider  | mod_url |
| -----------| ------------------------------------------------------------- |
| [Azure](https://hub.steampipe.io/mods/turbot/terraform_azure_compliance) | https://github.com/turbot/steampipe-mod-terraform-azure-compliance.git |
| [GCP](https://hub.steampipe.io/mods/turbot/terraform_gcp_compliance) | https://github.com/turbot/steampipe-mod-terraform-gcp-compliance.git |
| [OCI](https://hub.steampipe.io/mods/turbot/terraform_oci_compliance ) | https://github.com/turbot/steampipe-mod-terraform-oci-compliance.git |
| [AWS](https://hub.steampipe.io/mods/turbot/terraform_aws_compliance ) | https://github.com/turbot/steampipe-mod-terraform-aws-compliance.git |

## Optional inputs

You can provide additional parameters to customize the action.

| Parameter  | Description | Required | Default |
| -----------| -------------------------------------------------------------------------------------------------------- | ------------- | ------------- |
| github-token | Token is used to generate annotations. <br> `Note`: The GitHub token must have permissions to create annotations. | No | GITHUB_TOKEN |
| mod_url | URL of the [terraform compliance mod]((https://hub.steampipe.io/mods?q=terraform)) to be installed. This will be passed on to `git clone` | Yes | - |
| paths | List of globs to search for Terraform configuration files (comma-separated). | No | Repository root |
| checks | List of benchmarks and controls to run (space-separated or multi-line). | No | all |
| steampipe_version | Steampipe version to install | No | latest |

## Optional input examples

1. To limit the number of benchmarks and controls, include the `Checks` parameter.

```yaml
name: Run Steampipe Terraform AWS Compliance
uses: turbot/steampipe-iac-action
with:
  mod_url: 'https://github.com/turbot/steampipe-mod-terraform-aws-compliance.git'
  checks: benchmark.kms
```

<img src="images/input-checks-param.png"  width="60%" height="30%"> <br>

2. Change the version of Steampipe to be installed by including the `steampipe_version` parameter.

```yaml
name: Run Steampipe Terraform Compliance
uses: turbot/steampipe-iac-action
with:
  mod_url: 'https://github.com/turbot/steampipe-mod-terraform-aws-compliance.git'
  steampipe_version: v0.19.4
```
<img src="images/input-steampipe-version-param.png"  width="60%" height="50%">

3. Specify the location to locate the Terraform configuration file by including the `paths` parameter.

```yaml
name: Run Steampipe Terraform Compliance
uses: turbot/steampipe-iac-action
with:
  mod_url: https://github.com/turbot/steampipe-mod-terraform-aws-compliance.git
  path: examples/terraform//**.tf # Relative to repository root
```

> Refer to https://hub.steampipe.io/plugins/turbot/terraform#configuring-local-file-paths for local file path configuration.

Samples with customized parameters can be found in the `examples/workflow` folder, which you can refer to.

## Annotations

On successful scans, checks configured to run against changed files in a pull request provide annotations showing details about the code with errors and alarms.

<img src="images/annotations_sample.png"  width="60%" height="30%">

### Helpful links
- [Terraform AWS Compliance benchmarks](https://hub.steampipe.io/mods/turbot/terraform_aws_compliance/controls#benchmarks)
- [Terraform Azure Compliance benchmarks](https://hub.steampipe.io/mods/turbot/terraform_azure_compliance/controls#benchmarks)
- [Terraform GCP Compliance benchmarks](https://hub.steampipe.io/mods/turbot/terraform_gcp_compliance/controls#benchmarks)
- [Terraform OCI Compliance benchmarks](https://hub.steampipe.io/mods/turbot/terraform_oci_compliance/controls#benchmarks)
- [Supported terraform path formats](https://hub.steampipe.io/plugins/turbot/terraform#supported-path-formats)