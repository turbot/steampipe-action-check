locals {
  github_pull_request_external_common_tags = {
    service = "GitHub/PullRequest"
  }
}

dashboard "github_pull_request_plugin_mod_dashboard" {

  title = "GitHub Pull Request Dashboard"

  tags = merge(local.github_pull_request_external_common_tags, {
    type = "Report"
  })

  container {

    # Analysis
    card {
      sql   = query.github_pull_request_external_count.sql
      width = 2
    }

    card {
      sql   = query.github_pull_request_plugin_external_count.sql
      width = 2
    }

    card {
      sql   = query.github_pull_request_mod_external_count.sql
      width = 2
    }

    card {
      sql   = query.github_pull_request_open_total_days_count.sql
      width = 2
    }

    table {
      sql = query.github_pull_request_external_detail.sql
    }

  }

}

query "github_pull_request_external_count" {
  sql = <<-EOQ
    select 
      count(*) as "Open External Pull Requests" 
    from 
      github_search_pull_request
    where
      query='org:turbot is:open'
      and repository_full_name ~ 'turbot/steampipe-(plugin|mod)'
      and "user" ->> 'login' not in (
        select
          jsonb_array_elements_text(g.member_logins) as member_login    
        from
          github_my_organization g
        where
          g.login = any( array['turbot', 'turbotio'] )      
       );
    EOQ
}

query "github_pull_request_plugin_external_count" {
  sql = <<-EOQ
    select 
      count(*) as "Open Plugin External Pull Requests" 
    from 
      github_search_pull_request
    where
      query='org:turbot is:open'
      and repository_full_name ~ 'turbot/steampipe-plugin'
      and "user" ->> 'login' not in (
        select
          jsonb_array_elements_text(g.member_logins) as member_login    
        from
          github_my_organization g
        where
          g.login = any( array['turbot', 'turbotio'] )      
       );
    EOQ
}

query "github_pull_request_mod_external_count" {
  sql = <<-EOQ
    select 
      count(*) as "Open Mod External Pull Requests" 
    from 
      github_search_pull_request
    where
      query='org:turbot is:open'
      and repository_full_name ~ 'turbot/steampipe-mod'
      and "user" ->> 'login' not in (
        select
          jsonb_array_elements_text(g.member_logins) as member_login    
        from
          github_my_organization g
        where
          g.login = any( array['turbot', 'turbotio'] )      
       );
    EOQ
}

query "github_pull_request_open_total_days_count" {
  sql = <<-EOQ
    select 
      sum(now()::date - created_at::date) as "Total Days" 
    from 
      github_search_pull_request
    where
      query='org:turbot is:open'
      and repository_full_name ~ 'turbot/steampipe-(plugin|mod)'
      and "user" ->> 'login' not in (
        select
          jsonb_array_elements_text(g.member_logins) as member_login    
        from
          github_my_organization g
        where
          g.login = any( array['turbot', 'turbotio'] )      
       );
    EOQ
}

query "github_pull_request_external_detail" {
  sql = <<-EOQ
    select
      html_url as "GitHub PR",
      now()::date - created_at::date as "Age in Days",
      now()::date - updated_at::date as "Days since last update", 
      "user" ->> 'login' as "Author",
      repository_full_name
    from
      github_search_pull_request
    where
      query='org:turbot is:open'
      and repository_full_name ~ 'turbot/steampipe-(plugin|mod)'
      and "user" ->> 'login' not like 'dependabot%'
      and "user" ->> 'login' not in (
        select
          jsonb_array_elements_text(g.member_logins) as member_login    
        from
          github_my_organization g
        where
          g.login = any( array['turbot', 'turbotio'] )      
        );
  EOQ
}
