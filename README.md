# Steampipe IaC Action

[![Maintained by Steampipe.io](https://img.shields.io/badge/maintained%20by-steampipe.io-c33)](https://steampipe.io/?utm_source=github&utm_medium=organic_oss&utm_campaign=polygoat) &nbsp;
[![AWS Terraform Compliance](https://img.shields.io/badge/terraform-AWS_Compliance-orange)](https://hub.steampipe.io/mods/turbot/terraform_aws_compliance) &nbsp;
[![Azure Terraform Compliance](https://img.shields.io/badge/terraform-Azure_Compliance-blue)](https://hub.steampipe.io/mods/turbot/terraform_azure_compliance) &nbsp;
[![GCP Terraform Compliance](https://img.shields.io/badge/terraform-GCP_Compliance-blue)](https://hub.steampipe.io/mods/turbot/terraform_gcp_compliance) &nbsp;
[![OCI Terraform Compliance](https://img.shields.io/badge/terraform-OCI_Compliance-red)](https://hub.steampipe.io/mods/turbot/terraform_oci_compliance) &nbsp;
![License](https://img.shields.io/badge/license-Apache-blue)  &nbsp;

## Integrate Steampipe IaC to your GitHub workflows

The Steampipe IaC action enables scanning your Terraform Infrastructure as Code (IaC) files directly from the repository using your GitHub workflow pipeline. This allows you to proactively identify potential security vulnerabilities, compliance issues, and infrastructure misconfigurations early in the cycle.

## Getting started

To get started with scanning your AWS Terraform resources, add the following step to your workflow file.

```yaml
steps:
  ...
  - name: Scan Terraform aws resources
    uses: turbot/steampipe-iac-action
    with:
      mod_url: https://github.com/turbot/steampipe-mod-terraform-aws-compliance.git
```

This uses the `turbot/steampipe-iac-action` action to all Terraform files in your repository containing AWS resources and looks for potential vulnerabilities.

## Supported cloud providers

You can change the **`mod_url`** parameter to perform a scan on Terraform resources of other supported cloud providers.

| Provider                                                                 | `mod_url`                                                              |
| ------------------------------------------------------------------------ | ---------------------------------------------------------------------- |
| [Azure](https://hub.steampipe.io/mods/turbot/terraform_azure_compliance) | https://github.com/turbot/steampipe-mod-terraform-azure-compliance.git |
| [GCP](https://hub.steampipe.io/mods/turbot/terraform_gcp_compliance)     | https://github.com/turbot/steampipe-mod-terraform-gcp-compliance.git   |
| [OCI](https://hub.steampipe.io/mods/turbot/terraform_oci_compliance )    | https://github.com/turbot/steampipe-mod-terraform-oci-compliance.git   |
| [AWS](https://hub.steampipe.io/mods/turbot/terraform_aws_compliance )    | https://github.com/turbot/steampipe-mod-terraform-aws-compliance.git   |

## Optional inputs

You can provide additional parameters to customize the action.

| Parameter         | Description                                                                                                                               | Required | Default         |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | -------- | --------------- |
| mod_url           | URL of the [terraform compliance mod]((https://hub.steampipe.io/mods?q=terraform)) to be installed. This will be passed on to `git clone` | Yes      | -               |
| paths             | List of globs to search for Terraform configuration files (comma-separated).                                                              | No       | Repository root |
| checks            | List of benchmarks and controls to run (space-separated or multi-line).                                                                   | No       | all             |
| steampipe_version | Steampipe version to install. For available versions refer to [Steampipe Releases](https://github.com/turbot/steampipe/releases)          | No       | latest          |
| github_token      | Token used to generate annotations and job summary and as such must have the necessary permissions.                                       | No       | `GITHUB_TOKEN`  |

## Scenarios

  - [To run specific benchmarks and controls](#to-run-specific-benchmarks-and-controls-include-the-checks-input)
  - [Pin the Steampipe version to be installed](#pin-the-steampipe-version-to-be-installed-with-the-steampipe_version-input)
  - [Specify the Terraform files to scan](#specify-the-terraform-files-to-scan-with-the-paths-input)
  - [Specify multiple paths](#specify-multiple-paths-to-locate-terraform-files-to-scan-with-the-paths-input)

### To run specific benchmarks and controls, include the `checks` input.

```yaml
name: Run Steampipe Terraform AWS Compliance
uses: turbot/steampipe-iac-action
with:
  mod_url: 'https://github.com/turbot/steampipe-mod-terraform-aws-compliance.git'
  checks: |
    benchmark.kms
    benchmark.apigateway
    benchmark.ebs
```

> Refer to the benchmarks/controls available for your cloud provider [here](#helpful-links)

<img src="images/input-checks-param.png"  width="60%" height="30%">

### Pin the Steampipe version to be installed with the `steampipe_version` input.

```yaml
name: Run Steampipe Terraform Compliance
uses: turbot/steampipe-iac-action
with:
  mod_url: 'https://github.com/turbot/steampipe-mod-terraform-aws-compliance.git'
  steampipe_version: v0.19.4
```
<img src="images/input-steampipe-version-param.png"  width="60%" height="50%">

### Specify the Terraform files to scan with the `paths` input.

```yaml
name: Run Steampipe Terraform Compliance
uses: turbot/steampipe-iac-action
with:
  mod_url: https://github.com/turbot/steampipe-mod-terraform-aws-compliance.git
  paths: examples/terraform//**.tf # Relative to repository root
```

> Refer to https://hub.steampipe.io/plugins/turbot/terraform#configuring-local-file-paths for local file path configuration.

### Specify multiple paths to locate Terraform files to scan with the `paths` input.

```yaml
name: Run Steampipe Terraform Compliance
uses: turbot/steampipe-iac-action
with:
  mod_url: https://github.com/turbot/steampipe-mod-terraform-aws-compliance.git
  paths: |
    examples/terraform//*.tf
    service_provider/gcp/scan.tf
    /azure/compliance//*.tf
```

Samples with customized parameters can be found in the `examples/workflow` folder, which you can refer to.

## Annotations and summary

The action annotates your repository files with any `alarms` or `errors` encountered in the scan if the action is triggered by a Pull Request.

The action also produces an easy-to-read summary of the scan and pushes it to the **Job Summary**.

<img src="images/annotations_sample.png"  width="60%">
<img src="images/summary-output.png"  width="60%">

### Helpful links
- [Terraform AWS Compliance benchmarks](https://hub.steampipe.io/mods/turbot/terraform_aws_compliance/controls#benchmarks)
- [Terraform Azure Compliance benchmarks](https://hub.steampipe.io/mods/turbot/terraform_azure_compliance/controls#benchmarks)
- [Terraform GCP Compliance benchmarks](https://hub.steampipe.io/mods/turbot/terraform_gcp_compliance/controls#benchmarks)
- [Terraform OCI Compliance benchmarks](https://hub.steampipe.io/mods/turbot/terraform_oci_compliance/controls#benchmarks)
- [Supported Terraform path formats](https://hub.steampipe.io/plugins/turbot/terraform#supported-path-formats)
