app_name = "workspace_insights"
app_title = "Workspace Insights"
app_publisher = "sk"
app_description = "Analyze Google Workspace usage, domains, and license distribution with clear monthly insights"
app_email = "sk@gmail.com"
app_license = "mit"

# Apps
# ------------------

# required_apps = []

# Each item in the list will be shown as an app in the apps page
# add_to_apps_screen = [
# 	{
# 		"name": "workspace_insights",
# 		"logo": "/assets/workspace_insights/logo.png",
# 		"title": "Workspace Insights",
# 		"route": "/workspace_insights",
# 		"has_permission": "workspace_insights.api.permission.has_app_permission"
# 	}
# ]

# Includes in <head>
# ------------------

# include js, css files in header of desk.html
# app_include_css = "/assets/workspace_insights/css/workspace_insights.css"
# app_include_js = "/assets/workspace_insights/js/workspace_insights.js"

# include js, css files in header of web template
# web_include_css = "/assets/workspace_insights/css/workspace_insights.css"
# web_include_js = "/assets/workspace_insights/js/workspace_insights.js"

# include custom scss in every website theme (without file extension ".scss")
# website_theme_scss = "workspace_insights/public/scss/website"

# include js, css files in header of web form
# webform_include_js = {"doctype": "public/js/doctype.js"}
# webform_include_css = {"doctype": "public/css/doctype.css"}

# include js in page
# page_js = {"page" : "public/js/file.js"}

# include js in doctype views
# doctype_js = {"doctype" : "public/js/doctype.js"}
# doctype_list_js = {"doctype" : "public/js/doctype_list.js"}
# doctype_tree_js = {"doctype" : "public/js/doctype_tree.js"}
# doctype_calendar_js = {"doctype" : "public/js/doctype_calendar.js"}

# Svg Icons
# ------------------
# include app icons in desk
# app_include_icons = "workspace_insights/public/icons.svg"

# Home Pages
# ----------

# application home page (will override Website Settings)
# home_page = "login"

# website user home page (by Role)
# role_home_page = {
# 	"Role": "home_page"
# }

# Generators
# ----------

# automatically create page for each record of this doctype
# website_generators = ["Web Page"]

# Jinja
# ----------

# add methods and filters to jinja environment
# jinja = {
# 	"methods": "workspace_insights.utils.jinja_methods",
# 	"filters": "workspace_insights.utils.jinja_filters"
# }

# Installation
# ------------

# before_install = "workspace_insights.install.before_install"
# after_install = "workspace_insights.install.after_install"

# Uninstallation
# ------------

# before_uninstall = "workspace_insights.uninstall.before_uninstall"
# after_uninstall = "workspace_insights.uninstall.after_uninstall"

# Integration Setup
# ------------------
# To set up dependencies/integrations with other apps
# Name of the app being installed is passed as an argument

# before_app_install = "workspace_insights.utils.before_app_install"
# after_app_install = "workspace_insights.utils.after_app_install"

# Integration Cleanup
# -------------------
# To clean up dependencies/integrations with other apps
# Name of the app being uninstalled is passed as an argument

# before_app_uninstall = "workspace_insights.utils.before_app_uninstall"
# after_app_uninstall = "workspace_insights.utils.after_app_uninstall"

# Desk Notifications
# ------------------
# See frappe.core.notifications.get_notification_config

# notification_config = "workspace_insights.notifications.get_notification_config"

# Permissions
# -----------
# Permissions evaluated in scripted ways

# permission_query_conditions = {
# 	"Event": "frappe.desk.doctype.event.event.get_permission_query_conditions",
# }
#
# has_permission = {
# 	"Event": "frappe.desk.doctype.event.event.has_permission",
# }

# DocType Class
# ---------------
# Override standard doctype classes

# override_doctype_class = {
# 	"ToDo": "custom_app.overrides.CustomToDo"
# }

# Document Events
# ---------------
# Hook on document methods and events

# doc_events = {
# 	"*": {
# 		"on_update": "method",
# 		"on_cancel": "method",
# 		"on_trash": "method"
# 	}
# }

# Scheduled Tasks
# ---------------

# scheduler_events = {
# 	"all": [
# 		"workspace_insights.tasks.all"
# 	],
# 	"daily": [
# 		"workspace_insights.tasks.daily"
# 	],
# 	"hourly": [
# 		"workspace_insights.tasks.hourly"
# 	],
# 	"weekly": [
# 		"workspace_insights.tasks.weekly"
# 	],
# 	"monthly": [
# 		"workspace_insights.tasks.monthly"
# 	],
# }

# Testing
# -------

# before_tests = "workspace_insights.install.before_tests"

# Overriding Methods
# ------------------------------
#
# override_whitelisted_methods = {
# 	"frappe.desk.doctype.event.event.get_events": "workspace_insights.event.get_events"
# }
#
# each overriding function accepts a `data` argument;
# generated from the base implementation of the doctype dashboard,
# along with any modifications made in other Frappe apps
# override_doctype_dashboards = {
# 	"Task": "workspace_insights.task.get_dashboard_data"
# }

# exempt linked doctypes from being automatically cancelled
#
# auto_cancel_exempted_doctypes = ["Auto Repeat"]

# Ignore links to specified DocTypes when deleting documents
# -----------------------------------------------------------

# ignore_links_on_delete = ["Communication", "ToDo"]

# Request Events
# ----------------
# before_request = ["workspace_insights.utils.before_request"]
# after_request = ["workspace_insights.utils.after_request"]

# Job Events
# ----------
# before_job = ["workspace_insights.utils.before_job"]
# after_job = ["workspace_insights.utils.after_job"]

# User Data Protection
# --------------------

# user_data_fields = [
# 	{
# 		"doctype": "{doctype_1}",
# 		"filter_by": "{filter_by}",
# 		"redact_fields": ["{field_1}", "{field_2}"],
# 		"partial": 1,
# 	},
# 	{
# 		"doctype": "{doctype_2}",
# 		"filter_by": "{filter_by}",
# 		"partial": 1,
# 	},
# 	{
# 		"doctype": "{doctype_3}",
# 		"strict": False,
# 	},
# 	{
# 		"doctype": "{doctype_4}"
# 	}
# ]

# Authentication and authorization
# --------------------------------

# auth_hooks = [
# 	"workspace_insights.auth.validate"
# ]

# Automatically update python controller files with type annotations for this app.
# export_python_type_annotations = True

# default_log_clearing_doctypes = {
# 	"Logging DocType Name": 30  # days to retain logs
# }

