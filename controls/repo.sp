
/*
benchmark "steampipe_repo_configuration" {
  title = "Steampipe Repo Configuration"
  children = [
    benchmark.common,
    benchmark.plugin,
    benchmark.mod,
  ]
}
*/

variable "github_external_repo_names" {
  type        = list(string)
  description = "A list of community repositories to run checks for."
  default     = [ "francois2metz/steampipe-plugin-ovh", "theapsgroup/steampipe-plugin-vault", "francois2metz/steampipe-plugin-scalingo", "francois2metz/steampipe-plugin-gandi", "francois2metz/steampipe-plugin-airtable", "theapsgroup/steampipe-plugin-gitlab", "ellisvalentiner/steampipe-plugin-confluence", "theapsgroup/steampipe-plugin-keycloak" ]
}

benchmark "common" {
  title = "Common"
  children = [
    control.license_is_apache,
    control.repo_homepage_links_to_hub,
    control.repo_wiki_disabled,
    control.repo_projects_disabled,
    # control.repo_has_no_collaborators,
    control.repo_is_public,
  ]
}

benchmark "plugin" {
  title = "Plugin"
  children = [
    control.plugin_repo_description,
    control.plugin_repo_has_mandatory_topics,
    control.plugin_repo_language_is_go,
    control.plugin_uses_semantic_versioning,
  ]
}

benchmark "mod" {
  title = "Mod"
  children = [
    control.mod_repo_has_mandatory_topics,
    control.mod_repo_language_is_hcl,
    control.mod_uses_monotonic_versioning,
  ]
}

control "plugin_repo_description" {
  title = "Plugin repo has standard description"
  sql = <<-EOT
    (
    select
      html_url as resource,
      case
        when description like 'Use SQL to instantly query %. Open source CLI. No DB required.' then 'ok'
        else 'alarm'
      end as status,
      full_name || ': ' || description as reason,
      full_name
    from
      github_my_repository
    where
      full_name like 'turbot/steampipe-plugin-%'      
    )
    union
    (
    select
      html_url as resource,
      case
        when description like 'Use SQL to instantly query %. Open source CLI. No DB required.' then 'ok'
        else 'alarm'
      end as status,
      full_name || ': ' || description as reason,
      full_name
    from
      github_repository
    where
      full_name in (select jsonb_array_elements_text(to_jsonb($1::text[])))       
    )
  EOT
  param "github_external_repo_names" {
    description = "External repo names."
    default     = var.github_external_repo_names
  }
}

control "plugin_repo_has_mandatory_topics" {
  title = "Plugin repo has mandatory topics"
  sql = <<-EOT
    (
    with input as (
      select array['sql', 'steampipe', 'steampipe-plugin', 'postgresql', 'postgresql-fdw'] as mandatory_topics
    ),
    analysis as (
      select
        html_url,
        topics ?& (input.mandatory_topics) as has_mandatory_topics,
        to_jsonb(input.mandatory_topics) - array(select jsonb_array_elements_text(topics)) as missing_topics,
        full_name
      from
        github_my_repository,
        input
      where
        full_name like 'turbot/steampipe-plugin-%'
    )
    select
      html_url as resource,
      case
        when has_mandatory_topics then 'ok'
        else 'alarm'
      end as status,
      case
        when has_mandatory_topics then full_name || ' has all mandatory topics.'
        else full_name || ' is missing topics ' || missing_topics
      end as reason,
      full_name
    from
      analysis      
    )
    union 
    (
    with input as (
      select array['sql', 'steampipe', 'steampipe-plugin', 'postgresql', 'postgresql-fdw'] as mandatory_topics
    ),
    analysis as (
      select
        html_url,
        topics ?& (input.mandatory_topics) as has_mandatory_topics,
        to_jsonb(input.mandatory_topics) - array(select jsonb_array_elements_text(topics)) as missing_topics,
        full_name
      from
        github_repository,
        input
    where
      full_name in (select jsonb_array_elements_text(to_jsonb($1::text[]))) 
    )
    select
      html_url as resource,
      case
        when has_mandatory_topics then 'ok'
        else 'alarm'
      end as status,
      case
        when has_mandatory_topics then full_name || ' has all mandatory topics.'
        else full_name || ' is missing topics ' || missing_topics
      end as reason,
      full_name
    from
      analysis      
    )
  EOT
  param "github_external_repo_names" {
    description = "External repo names."
    default     = var.github_external_repo_names
  }
}

control "mod_repo_has_mandatory_topics" {
  title = "Mod repo has mandatory topics"
  sql = <<-EOT
    with input as (
      select array['sql', 'steampipe', 'steampipe-mod'] as mandatory_topics
    ),
    analysis as (
      select
        html_url,
        topics ?& (input.mandatory_topics) as has_mandatory_topics,
        to_jsonb(input.mandatory_topics) - array(select jsonb_array_elements_text(topics)) as missing_topics,
        full_name
      from
        github_my_repository,
        input
      where
        full_name like 'turbot/steampipe-mod-%'
        and full_name not like '%-wip'
    )
    select
      html_url as resource,
      case
        when has_mandatory_topics then 'ok'
        else 'alarm'
      end as status,
      case
        when has_mandatory_topics then full_name || ' has all mandatory topics.'
        else full_name || ' is missing topics ' || missing_topics
      end as reason,
      full_name
    from
      analysis
  EOT
}

control "plugin_uses_semantic_versioning" {
  title = "Plugin uses semantic versioning"
  sql = <<-EOT
    (
    select
      r.html_url || '@' || t.name as resource,
      case
        when t.name ~ '^v[0-9]+\.[0-9]+\.[0-9]+$' then 'ok'
        when t.name ~ '^v[0-9]+\.[0-9]+\.[0-9]+' then 'info'
        else 'alarm'
      end as status,
      r.full_name || '@' || t.name as reason,
      r.full_name
    from
      github_my_repository as r,
      github_tag as t
    where
      r.full_name like 'turbot/steampipe-plugin-%'
      and r.full_name = t.repository_full_name      
    )
    union
    (
    select
      r.html_url || '@' || t.name as resource,
      case
        when t.name ~ '^v[0-9]+\.[0-9]+\.[0-9]+$' then 'ok'
        when t.name ~ '^v[0-9]+\.[0-9]+\.[0-9]+' then 'info'
        else 'alarm'
      end as status,
      r.full_name || '@' || t.name as reason,
      r.full_name
    from
      github_repository as r,
      github_tag as t
    where
      full_name in (select jsonb_array_elements_text(to_jsonb($1::text[])))  
      and r.full_name = t.repository_full_name
    )

  EOT
  param "github_external_repo_names" {
    description = "External repo names."
    default     = var.github_external_repo_names
  }
}

control "mod_uses_monotonic_versioning" {
  title = "Mod uses monotonic versioning"
  sql = <<-EOT
    select
      r.html_url || '@' || t.name as resource,
      case
        when t.name ~ '^v[0-9]+\.[0-9]+$' then 'ok'
        when t.name ~ '^v[0-9]+\.[0-9]+' then 'info'
        else 'alarm'
      end as status,
      r.full_name || '@' || t.name as reason,
      r.full_name
    from
      github_my_repository as r,
      github_tag as t
    where
      r.full_name like 'turbot/steampipe-mod-%'
      and r.full_name not like '%-wip'
      and r.full_name = t.repository_full_name
  EOT
}

control "license_is_apache" {
  title = "License is Apache 2.0"
  sql = <<-EOT
    (
    select
      html_url as resource,
      case
        when license_spdx_id = 'Apache-2.0' then 'ok'
        else 'alarm'
      end as status,
      full_name || ' license is ' || license_name as reason,
      full_name
    from
      github_my_repository
    where
      full_name ~ '^turbot/steampipe-(mod|plugin)-.+'
      and full_name not like '%-wip'      
    )
    union
    (
    select
      html_url as resource,
      case
        when license_spdx_id = 'Apache-2.0' then 'ok'
        else 'alarm'
      end as status,
      full_name || ' license is ' || license_name as reason,
      full_name
    from
      github_repository
    where
      full_name in (select jsonb_array_elements_text(to_jsonb($1::text[]))) 
      and full_name not like '%-wip'
    )

  EOT
  param "github_external_repo_names" {
    description = "External repo names."
    default     = var.github_external_repo_names
  }
}

control "repo_homepage_links_to_hub" {
  title = "Repo homepage links to the Hub"
  sql = <<-EOT
    (
    select
      html_url as resource,
      case
        when homepage like 'https://hub.%' then 'ok'
        else 'alarm'
      end as status,
      full_name || ' homepage is ' || coalesce(homepage, 'not set') as reason,
      full_name
    from
      github_my_repository
    where
      full_name ~ '^turbot/steampipe-(mod|plugin)-.+'
      and full_name not like '%-wip'    
    )
    union
    (
    select
      html_url as resource,
      case
        when homepage like 'https://hub.%' then 'ok'
        else 'alarm'
      end as status,
      full_name || ' homepage is ' || coalesce(homepage, 'not set') as reason,
      full_name
    from
      github_repository
    where
      full_name in (select jsonb_array_elements_text(to_jsonb($1::text[]))) 
      and full_name not like '%-wip'
    )

  EOT
  param "github_external_repo_names" {
    description = "External repo names."
    default     = var.github_external_repo_names
  }
}

control "repo_wiki_disabled" {
  title = "Repo Wiki is Disabled"
  sql = <<-EOT
    (
    select
      html_url as resource,
      case
        when has_wiki then 'alarm'
        else 'ok'
      end as status,
      full_name || ' wiki is ' || has_wiki as reason,
      full_name
    from
      github_my_repository
    where
      full_name ~ '^turbot/steampipe-(mod|plugin)-.+'
      and full_name not like '%-wip'    
    )
    union
    (
    select
      html_url as resource,
      case
        when has_wiki then 'alarm'
        else 'ok'
      end as status,
      full_name || ' wiki is ' || has_wiki as reason,
      full_name
    from
      github_repository
    where
      full_name in (select jsonb_array_elements_text(to_jsonb($1::text[]))) 
      and full_name not like '%-wip'    
    )
  EOT
  param "github_external_repo_names" {
    description = "External repo names."
    default     = var.github_external_repo_names
  }
}

control "repo_projects_disabled" {
  title = "Repo Projects is Disabled"
  sql = <<-EOT
    (
    select
      html_url as resource,
      case
        when has_projects then 'alarm'
        else 'ok'
      end as status,
      full_name || ' projects is ' || has_projects as reason,
      full_name
    from
      github_my_repository
    where
      full_name ~ '^turbot/steampipe-(mod|plugin)-.+'
      and full_name not like '%-wip'    
    )
    union
    (
    select
      html_url as resource,
      case
        when has_projects then 'alarm'
        else 'ok'
      end as status,
      full_name || ' projects is ' || has_projects as reason,
      full_name
    from
      github_repository
    where
      full_name in (select jsonb_array_elements_text(to_jsonb($1::text[]))) 
      and full_name not like '%-wip'
    )

  EOT
  param "github_external_repo_names" {
    description = "External repo names."
    default     = var.github_external_repo_names
  }
}

// TODO - collaborators is currently both inside and outside, so not helpful here
# control "repo_has_no_collaborators" {
#   title = "Repo has no collaborators"
#   sql = <<-EOT
#     (
#     select
#       html_url as resource,
#       case
#         when jsonb_array_length(collaborator_logins) = 0 then 'alarm'
#         else 'ok'
#       end as status,
#       full_name || ' has ' || jsonb_array_length(collaborator_logins) || ' collaborators.' as reason,
#       full_name
#     from
#       github_my_repository
#     where
#       full_name ~ '^turbot/steampipe-(mod|plugin)-.+'
#       and full_name not like '%-wip'    
#     )
#     union
#     (
#     select
#       html_url as resource,
#       case
#         when jsonb_array_length(collaborator_logins) = 0 then 'alarm'
#         else 'ok'
#       end as status,
#       full_name || ' has ' || jsonb_array_length(collaborator_logins) || ' collaborators.' as reason,
#       full_name
#     from
#       github_repository
#     where
#       full_name in (select jsonb_array_elements_text(to_jsonb($1::text[]))) 
#       and full_name not like '%-wip'
#     )

#   EOT
#   param "github_external_repo_names" {
#     description = "External repo names."
#     default     = var.github_external_repo_names
#   }
# }

control "plugin_repo_language_is_go" {
  title = "Plugin repository language is Go"
  sql = <<-EOT
    (
    select
      html_url as resource,
      case
        when language = 'Go' then 'ok'
        else 'alarm'
      end as status,
      full_name || ' language is ' || language as reason,
      full_name
    from
      github_my_repository
    where
      full_name like 'turbot/steampipe-plugin-%'    
    )
    union
    (
    select
      html_url as resource,
      case
        when language = 'Go' then 'ok'
        else 'alarm'
      end as status,
      full_name || ' language is ' || language as reason,
      full_name
    from
      github_repository
    where
      full_name in (select jsonb_array_elements_text(to_jsonb($1::text[]))) 
    )

  EOT
  param "github_external_repo_names" {
    description = "External repo names."
    default     = var.github_external_repo_names
  }
}

control "mod_repo_language_is_hcl" {
  title = "Mod repository language is HCL"
  sql = <<-EOT
    select
      html_url as resource,
      case
        when language = 'HCL' then 'ok'
        else 'alarm'
      end as status,
      full_name || ' language is ' || language as reason,
      full_name
    from
      github_my_repository
    where
      full_name like 'turbot/steampipe-mod-%'
      and full_name not like '%-wip'
  EOT
}

control "repo_is_public" {
  title = "Repository is public"
  sql = <<-EOT
    (
    select
      html_url as resource,
      case
        when visibility = 'public' then 'ok'
        else 'info'
      end as status,
      full_name || ' visibility is ' || visibility as reason,
      full_name
    from
      github_my_repository
    where
      full_name ~ '^turbot/steampipe-(mod|plugin)-.+'
      and full_name not like '%-wip'    
    )
    union
    (
    select
      html_url as resource,
      case
        when visibility = 'public' then 'ok'
        else 'info'
      end as status,
      full_name || ' visibility is ' || visibility as reason,
      full_name
    from
      github_repository
    where
      full_name in (select jsonb_array_elements_text(to_jsonb($1::text[]))) 
      and full_name not like '%-wip'
    )

  EOT
  param "github_external_repo_names" {
    description = "External repo names."
    default     = var.github_external_repo_names
  }
}
