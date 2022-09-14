// Benchmarks and controls for specific services should override the "service" tag
locals {
  github_common_tags = {
    category = "Compliance"
    plugin   = "github"
    service  = "GitHub"
  }
}

mod "github_sherlock" {
  # hub metadata
  title       = "GitHub Tracker"
  description = "Track the GitHub issues and PRs raised by community."
  color       = "#191717"
  # documentation = file("./docs/index.md")
  icon       = "/images/mods/turbot/github-sherlock.svg"
  categories = ["best practices", "github", "sherlock", "software development"]

  opengraph {
    title       = "Steampipe Mod to Analyze GitHub"
    description = "Track the GitHub issues and PRs raised by community."
    image       = "/images/mods/turbot/github-sherlock-social-graphic.png"
  }
}
