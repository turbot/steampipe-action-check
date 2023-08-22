# Steampipe Check Action for GitHub Actions

Run a Steampipe check for mod benchmarks and controls.

## Usage

> This action requires you set-up Steampipe in your workflow in advance of using it, the recommend approach would be to utilise the [turbot/steampipe-action-setup](https://github.com/turbot/steampipe-action-setup) action, however you can set this up manually if you prefer.

When using this action, you will be required to provide a `mod-url` for the [Steampipe Mod](https://hub.steampipe.io/mods) containing the checks/benchmarks you wish to use.

```yaml
- name: Steampipe Checks
  uses: turbot/steampipe-action-setup@main
  with:
    mod-url: https://github.com/turbot/steampipe-mod-terraform-aws-compliance
```

For a full list of configuration options and descriptions see [action.yml](action.yml).

This action will produce an easy to read **Job Summary** as well as provide the results in `json`, `markdown` and `csv` within the job artifacts.

<img src="images/example_summary.png" width="80%">

## IaC Checks & Annotations

This action also allows you to scan your Infrastructure as Code (IaC) files directly from your GitHub repository using your workflow pipeline. This helps to identify potential security vulnerabilities, compliance issues, and infrastructure misconfigurations early in the development cycle.

For controls that scan local files, like those in the [Terraform AWS Compliance mod](https://github.com/turbot/steampipe-mod-terraform-aws-compliance), annotations can be created for any controls in `alarm` in the pull request that triggered this action run by setting the `create-annotations` option to `true`.

```yaml
- name: Steampipe Checks
  uses: turbot/steampipe-action-setup@main
  with:
    mod-url: https://github.com/turbot/steampipe-mod-terraform-aws-compliance
    create-annotations: true
```

<img src="images/example_annotations.png" width="80%" />

For a list of IaC mods offered by Turbot, please see [IaC mods](https://hub.steampipe.io/mods?categories=iac).

If you have created your own IaC `mod`, you can still benefit from `annotations`, as long as each `control` has a `path` column as an [additional dimension](https://steampipe.io/docs/reference/mod-resources/control#additional-control-columns--dimensions) with values in the format of `filepath:linenumber` for example `my_tf_files/aws/cloudtrail.tf:23`.

> NOTE: In order to create the annotations, you may need to ensure that the GitHub token provided has the permissions to write under `Settings -> Actions -> Workflow Permissions`, alternatively you can pass the `pull-requests: write` and `checks: write` permissions to the `job` see [job permissions](https://docs.github.com/en/actions/using-jobs/assigning-permissions-to-jobs).

Examples:
- [Basic Example](examples/workflow/pull_request_with_annotations.yml)
- [Permissions Example](examples/workflow/pull_request_with_annotations_with_permissions.yml)

## Examples

### Basic

```yaml
  - name: Setup Steampipe
    uses: turbot/steampipe-action-setup@v.1.4.0
    with:
      connections: |
        connection "terraform" {
          plugin = "terraform"
          paths  = [ "./**/*.tf" ]
        }

  - name: Run AWS compliance on Terraform resources
    uses: turbot/steampipe-action-check@main
    with:
      mod-url: https://github.com/turbot/steampipe-mod-terraform-aws-compliance
```

### Run a specific benchmark or control with the `checks` input.

```yaml
name: Run Steampipe Terraform AWS Compliance
uses: turbot/steampipe-action-check@main
with:
  mod-url: "https://github.com/turbot/steampipe-mod-terraform-aws-compliance"
  checks: benchmark.kms
```

_Refer to the benchmarks/controls available for your cloud provider [here](#helpful-links)._

### Run multiple benchmarks and controls with the `checks` input.

```yaml
name: Run Steampipe Terraform AWS Compliance
uses: turbot/steampipe-action-check@main
with:
  mod-url: "https://github.com/turbot/steampipe-mod-terraform-aws-compliance"
  checks: |
    benchmark.kms
    benchmark.ebs
    benchmark.apigateway
    control.ecs_cluster_container_insights_enabled
    control.ecs_task_definition_encryption_in_transit_enabled
```

### Create a public snapshot on Turbot Pipes

> Note: This example assumes you have a [Turbot Pipes](https://turbot.com/pipes) account and have [generated an API token](https://turbot.com/pipes/docs/profile#tokens) stored as a secret `PIPES_TOKEN` available to your repository.

```yaml
name: Steampipe Checks
uses: turbot/steampipe-action-setup@main
with:
  mod-url: https://github.com/turbot/steampipe-mod-terraform-aws-compliance
  snapshot-type: public
  pipes-token: ${{ secrets.PIPES_TOKEN }}
```

### Specify multiple paths to locate Terraform files to scan.

> Note: This is done in the Steampipe Setup

```yaml
  - name: Setup Steampipe
    uses: turbot/steampipe-action-setup@main
    with:
      connections: |
        connection "terraform" {
          plugin = "terraform"
          paths  = [ 
            "cloud_infra/service_billing/aws/**/*.tf", 
            "cloud_infra/service_orders/aws/**/*.tf" 
          ]
        }
  - name: Scan Terraform aws resources
    uses: turbot/steampipe-action-check
    with:
      mod-url: https://github.com/turbot/steampipe-mod-terraform-aws-compliance
```

_Refer to [terraform plugin docs](https://hub.steampipe.io/plugins/turbot/terraform#configuring-local-file-paths) for local file path configuration._

### Use the action multiple times to scan multi-cloud Terraform resources in the same job

```yaml
  - name: Setup Steampipe
    uses: turbot/steampipe-action-setup@main
    with:
      connections: |
        connection "aws_tf" {
          plugin = "terraform"
          paths  = [ 
            "cloud_infra/service_billing/aws/**/*.tf", 
            "cloud_infra/service_orders/aws/**/*.tf" 
          ]
        }

        connection "gcp_tf" {
          plugin = "terraform"
          paths  = [ 
            "cloud_infra/service_billing/gcp/**/*.tf", 
            "cloud_infra/service_orders/gcp/**/*.tf"
          ]
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

### More examples

For more examples, check out the [example workflows](https://github.com/turbot/steampipe-action-check/tree/main/examples/workflow).

## Helpful links

- [Steampipe docs](https://steampipe.io/docs)
- [Steampipe plugins](https://hub.steampipe.io/plugins)
- [Steampipe mods](https://hub.steampipe.io/mods)
