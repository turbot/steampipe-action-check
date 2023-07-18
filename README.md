# Steampipe Check Action for GitHub Actions

Run a Steampipe check for mod benchmarks and controls.

## IaC Checks

This action also allows you to scan your Infrastructure as Code (IaC) files directly from your GitHub repository using your workflow pipeline. This helps to identify potential security vulnerabilities, compliance issues, and infrastructure misconfigurations early in the development cycle.

For controls that scan local files, like those in the [Terraform AWS Compliance mod](https://github.com/turbot/steampipe-mod-terraform-aws-compliance), annotations will be created for any controls in `alarm` in the pull request that triggered this action run.

<img src="images/annotations_sample.png" width="80%" />

The action also produces an easy-to-read summary of the scan and pushes it to the **Job Summary**.

<img src="images/summary-output.png" width="80%" />

For a list of IaC mods offered by Turbot, please see [IaC mods](https://hub.steampipe.io/mods?categories=iac).

If you have created your own IaC `mod`, you can still benefit from `annotations`, as long as each `control` has a `path` column as an [additional dimension](https://steampipe.io/docs/reference/mod-resources/control#additional-control-columns--dimensions) with values in the format of `filepath:linenumber`, e.g., `my_tf_files/aws/cloudtrail.tf:23`.

## Usage

See [action.yml](action.yml).

## Examples

### Basic

```yaml
  - name: Setup Steampipe
    uses: turbot/steampipe-action-setup
    with:
      connections: |
        connection "terraform" {
          plugin = "terraform"
          paths  = [ "./**/*.tf" ]
        }

  - name: Run AWS compliance on Terraform resources
    uses: turbot/steampipe-action-check
    with:
      mod-url: https://github.com/turbot/steampipe-mod-terraform-aws-compliance
```

### Run a specific benchmark or control with the `checks` input.

```yaml
name: Run Steampipe Terraform AWS Compliance
uses: turbot/steampipe-action-check
with:
  mod-url: "https://github.com/turbot/steampipe-mod-terraform-aws-compliance"
  checks: benchmark.kms
```

> Refer to the benchmarks/controls available for your cloud provider [here](#helpful-links)

### Run multiple benchmarks and controls with the `checks` input.

```yaml
name: Run Steampipe Terraform AWS Compliance
uses: turbot/steampipe-action-check
with:
  mod-url: "https://github.com/turbot/steampipe-mod-terraform-aws-compliance"
  checks: |
    benchmark.kms
    benchmark.ebs
    benchmark.apigateway
    control.ecs_cluster_container_insights_enabled
    control.ecs_task_definition_encryption_in_transit_enabled
```

### Specify multiple paths to locate Terraform files to scan, with the `paths` input.

```yaml
  - name: Setup Steampipe
    uses: turbot/steampipe-action-setup
    with:
      connections: |
        connection "terraform" {
          plugin = "terraform"
          paths  = [ "cloud_infra/service_billing/aws/**/*.tf", "cloud_infra/service_orders/aws/**/*.tf" ]
        }
  - name: Scan Terraform aws resources
    uses: turbot/steampipe-action-check
    with:
      mod-url: https://github.com/turbot/steampipe-mod-terraform-aws-compliance
```

> Refer to https://hub.steampipe.io/plugins/turbot/terraform#configuring-local-file-paths for local file path configuration.

### Use the action multiple times to scan multi-cloud Terraform resources in the same job

```yaml
  - name: Setup Steampipe
    uses: turbot/steampipe-action-setup
    with:
      connections: |
        connection "aws_tf" {
          plugin = "terraform"
          paths  = [ "cloud_infra/service_billing/aws/**/*.tf", "cloud_infra/service_orders/aws/**/*.tf" ]
        }

        connection "gcp_tf" {
          plugin = "terraform"
          paths  = [ "cloud_infra/service_billing/gcp/**/*.tf", "cloud_infra/service_orders/gcp/**/*.tf" ]
        }
  - name: Run Steampipe Terraform Compliance on AWS
    uses: turbot/steampipe-action-check
    with:
      mod-url: https://github.com/turbot/steampipe-mod-terraform-aws-compliance

  - name: Run Steampipe Terraform Compliance on GCP
    uses: turbot/steampipe-action-check
    with:
      mod-url: https://github.com/turbot/steampipe-mod-terraform-gcp-compliance
      additional-args: '--search-path-prefix=gcp_tf'
```

### Helpful links

- [Steampipe docs](https://steampipe.io/docs)
- [Steampipe plugins](https://hub.steampipe.io/plugins)
- [Steampipe mods](https://hub.steampipe.io/mods)
