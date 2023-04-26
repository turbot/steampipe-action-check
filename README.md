# Steampipe IaC Action

[![Maintained by Steampipe.io](https://img.shields.io/badge/maintained%20by-steampipe.io-c33)](https://steampipe.io/?utm_source=github&utm_medium=organic_oss&utm_campaign=polygoat) &nbsp;
[![AWS Terraform Compliance](https://img.shields.io/badge/terraform-AWS_Compliance-orange)](https://hub.steampipe.io/mods/turbot/terraform_aws_compliance) &nbsp;
[![Azure Terraform Compliance](https://img.shields.io/badge/terraform-Azure_Compliance-blue)](https://hub.steampipe.io/mods/turbot/terraform_azure_compliance) &nbsp;
[![GCP Terraform Compliance](https://img.shields.io/badge/terraform-GCP_Compliance-blue)](https://hub.steampipe.io/mods/turbot/terraform_gcp_compliance) &nbsp;
[![OCI Terraform Compliance](https://img.shields.io/badge/terraform-OCI_Compliance-red)](https://hub.steampipe.io/mods/turbot/terraform_oci_compliance) &nbsp;
![License](https://img.shields.io/badge/license-Apache-blue) &nbsp;

## Integrate Steampipe IaC to your GitHub workflows

The Steampipe IaC action enables scanning your Terraform Infrastructure as Code (IaC) files directly from the repository using your GitHub workflow pipeline. This helps to identify potential security vulnerabilities, compliance issues, and infrastructure misconfigurations early in the development cycle.

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

> Here, the `mod_url` is the path to a Steampipe mod respository. To know more about Steampipe mods, head over to [this page](https://steampipe.io/docs/mods/overview#steampipe-mods).

This uses the `turbot/steampipe-iac-action` action to scan all Terraform files containing AWS resources in your repository and runs checks as defined by the mod.

## Supported cloud providers

You can use compliance mods published by the Steampipe team to scan Terraform resources for all supported cloud providers. Update the `mod_url` input to one of the given `git` repositories.

| Provider                                                                 | `mod_url`                                                              |
| ------------------------------------------------------------------------ | ---------------------------------------------------------------------- |
| [Azure](https://hub.steampipe.io/mods/turbot/terraform_azure_compliance) | https://github.com/turbot/steampipe-mod-terraform-azure-compliance.git |
| [GCP](https://hub.steampipe.io/mods/turbot/terraform_gcp_compliance)     | https://github.com/turbot/steampipe-mod-terraform-gcp-compliance.git   |
| [OCI](https://hub.steampipe.io/mods/turbot/terraform_oci_compliance)     | https://github.com/turbot/steampipe-mod-terraform-oci-compliance.git   |
| [AWS](https://hub.steampipe.io/mods/turbot/terraform_aws_compliance)     | https://github.com/turbot/steampipe-mod-terraform-aws-compliance.git   |

## Annotations and summary

The action annotates your repository files with any `alarms` encountered in the scan if the action is triggered by a Pull Request.

<img src="images/annotations_sample.png" width="80%" />

The action also produces an easy-to-read summary of the scan and pushes it to the **Job Summary**.

<img src="images/summary-output.png" width="80%" />

## Usage

```yaml
- name: Scan Terraform AWS resources
  uses: turbot/steampipe-iac-action
  with:
    # Git URL of the terraform compliance mod that runs. This is passed verbatim to `git clone`.
    #
    # required
    mod_url: https://github.com/turbot/steampipe-mod-terraform-aws-compliance.git

    # Pin to a specific Steampipe CLI version
    #
    # For available versions refer to [Steampipe Releases](https://github.com/turbot/steampipe/releases).
    #
    # default: latest
    steampipe_version: v0.19.2

    # A list of benchmarks and controls to run (multi-line).
    # If not specified it runs all benchmarks and controls in the mod.
    #
    # default: all
    checks: |
      benchmark.kms
      benchmark.ebs
      benchmark.apigateway
      control.ecs_cluster_container_insights_enabled
      control.ecs_task_definition_encryption_in_transit_enabled

    # The list of paths to scan, relative to the repository root.
    #
    # These must be valid filesystem glob patterns.
    #
    # Each glob pattern must be given in a newline.
    #
    # default: ./**/*.tf
    paths: |
      cloud_infra/service_billing/aws/**/*.tf
      cloud_infra/service_orders/aws/**/*.tf

    # Personal access token (PAT) used to push annotations and job summary
    #
    # We recommend using a service account with the least permissions necessary. Also
    # when generating a new PAT, select the least scopes necessary.
    #
    # [Learn more about creating and using encrypted secrets](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/creating-and-using-encrypted-secrets)
    #
    # Default: ${{ github.token }}
    github_token: ${{ secrets.ANNOTATION_GH_TOKEN }}
```

## Scenarios

- [Steampipe IaC Action](#steampipe-iac-action)
  - [Integrate Steampipe IaC to your GitHub workflows](#integrate-steampipe-iac-to-your-github-workflows)
  - [Getting started](#getting-started)
  - [Supported cloud providers](#supported-cloud-providers)
  - [Annotations and summary](#annotations-and-summary)
  - [Usage](#usage)
  - [Scenarios](#scenarios)
    - [Run a specific benchmark or control with the `checks` input.](#run-a-specific-benchmark-or-control-with-the-checks-input)
    - [Run multiple benchmarks and controls with the `checks` input.](#run-multiple-benchmarks-and-controls-with-the-checks-input)
    - [Pin the Steampipe version to be installed with the `steampipe_version` input.](#pin-the-steampipe-version-to-be-installed-with-the-steampipe_version-input)
    - [Specify the path to locate Terraform files to scan, with the `paths` input.](#specify-the-path-to-locate-terraform-files-to-scan-with-the-paths-input)
    - [Specify multiple paths to locate Terraform files to scan, with the `paths` input.](#specify-multiple-paths-to-locate-terraform-files-to-scan-with-the-paths-input)
    - [Use the action multiple times to scan multi-cloud terraform resources in the same job](#use-the-action-multiple-times-to-scan-multi-cloud-terraform-resources-in-the-same-job)
    - [Helpful links](#helpful-links)

### Run a specific benchmark or control with the `checks` input.

```yaml
name: Run Steampipe Terraform AWS Compliance
uses: turbot/steampipe-iac-action
with:
  mod_url: "https://github.com/turbot/steampipe-mod-terraform-aws-compliance.git"
  checks: benchmark.kms
```

> Refer to the benchmarks/controls available for your cloud provider [here](#helpful-links)

### Run multiple benchmarks and controls with the `checks` input.

```yaml
name: Run Steampipe Terraform AWS Compliance
uses: turbot/steampipe-iac-action
with:
  mod_url: "https://github.com/turbot/steampipe-mod-terraform-aws-compliance.git"
  checks: |
    benchmark.kms
    benchmark.ebs
    benchmark.apigateway
    control.ecs_cluster_container_insights_enabled
    control.ecs_task_definition_encryption_in_transit_enabled
```

### Pin the Steampipe version to be installed with the `steampipe_version` input.

```yaml
name: Run Steampipe Terraform Compliance
uses: turbot/steampipe-iac-action
with:
  mod_url: "https://github.com/turbot/steampipe-mod-terraform-aws-compliance.git"
  steampipe_version: v0.19.4
```

### Specify the path to locate Terraform files to scan, with the `paths` input.

```yaml
name: Run Steampipe Terraform Compliance
uses: turbot/steampipe-iac-action
with:
  mod_url: https://github.com/turbot/steampipe-mod-terraform-aws-compliance.git
  paths: terraform/**/*.tf # Relative to repository root
```

> Refer to https://hub.steampipe.io/plugins/turbot/terraform#configuring-local-file-paths for local file path configuration.

### Specify multiple paths to locate Terraform files to scan, with the `paths` input.

```yaml
name: Run Steampipe Terraform Compliance
uses: turbot/steampipe-iac-action
with:
  mod_url: https://github.com/turbot/steampipe-mod-terraform-aws-compliance.git
  paths: |
    cloud_infra/service_billing/aws/**/*.tf
    cloud_infra/service_orders/aws/**/*.tf
```

For more examples refer to the [`examples/workflow`](https://github.com/turbot/steampipe-iac-action/tree/infra-scan/examples/workflow) directory.

### Use the action multiple times to scan multi-cloud terraform resources in the same job

```yaml
steps:
  name: Run Steampipe Terraform Compliance on AWS
  uses: turbot/steampipe-iac-action
  with:
    mod_url: https://github.com/turbot/steampipe-mod-terraform-aws-compliance.git
    paths: |
      cloud_infra/service_billing/aws/**/*.tf
      cloud_infra/service_orders/aws/**/*.tf

  name: Run Steampipe Terraform Compliance on GCP
  uses: turbot/steampipe-iac-action
  with:
    mod_url: https://github.com/turbot/steampipe-mod-terraform-gcp-compliance.git
    paths: |
      cloud_infra/service_billing/gcp/**/*.tf
      cloud_infra/service_orders/gcp/**/*.tf
```

For more examples refer to the [`examples/workflow`](https://github.com/turbot/steampipe-iac-action/tree/infra-scan/examples/workflow) directory.

### Helpful links

- [Terraform AWS Compliance benchmarks](https://hub.steampipe.io/mods/turbot/terraform_aws_compliance/controls#benchmarks)
- [Terraform Azure Compliance benchmarks](https://hub.steampipe.io/mods/turbot/terraform_azure_compliance/controls#benchmarks)
- [Terraform GCP Compliance benchmarks](https://hub.steampipe.io/mods/turbot/terraform_gcp_compliance/controls#benchmarks)
- [Terraform OCI Compliance benchmarks](https://hub.steampipe.io/mods/turbot/terraform_oci_compliance/controls#benchmarks)
- [Supported Terraform path formats](https://hub.steampipe.io/plugins/turbot/terraform#supported-path-formats)
