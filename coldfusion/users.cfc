<!----------------------------------------------------------------
Template: users.cfm

Date created: 08/06/2011

Type: Template

Description: 

Related files:
----------------------------------------------------------------->
<cfcomponent name="users">
	
	<!--- display_signin --->
	<cffunction name="check_signedin" output="yes" access="remote">
		<cfinclude template="#application.g.s_path_handlers#/users/check_signedin.cfm">
	</cffunction>
	
	<!--- assign user meta data --->
	<cffunction name="assign_meta" output="yes" access="remote">
		<cfargument name="s_username" required="yes">

		<!--- copy arguments to local scope --->
		<cfset variables.arguments = arguments>
		
		<cfinclude template="#application.g.s_path_handlers#/users/assign_meta.cfm">
	</cffunction>
	
	<!--- check if username exists --->
	<cffunction name="check_username" output="yes" access="remote">
		<cfargument name="s_username" required="yes">
		<!--- copy arguments to local scope --->
		<cfset variables.arguments = arguments>
		
		<cfinclude template="#application.g.s_path_handlers#/users/check_username.cfm">
		<cfreturn s_success>
	</cffunction>
	
	<!--- attempt to signin --->
	<cffunction name="signin" output="yes" access="remote">
		<cfargument name="s_username" required="yes" default="">
		<cfargument name="s_password" required="yes" default="">
		<!--- copy arguments to local scope --->
		<cfset variables.arguments = arguments>
		
		<cfinclude template="#application.g.s_path_handlers#/users/signin.cfm">
		<cfreturn s_success>
	</cffunction>
	
	<!--- reset password --->
	<cffunction name="reset_password" output="yes" access="remote">
		<cfargument name="s_username" required="yes" default="">
		<cfargument name="b_mail" required="no" default="true">
		<!--- copy arguments to local scope --->
		<cfset variables.arguments = arguments>
		
		<cfinclude template="#application.g.s_path_handlers#/users/reset_password.cfm">
		<cfreturn s_success>
	</cffunction>
	
	<!--- delete session --->
	<cffunction name="clear_user" output="yes" access="remote">
		<cfinclude template="#application.g.s_path_handlers#/users/clear_user.cfm">
	</cffunction>
	
	<!--- user header --->
	<cffunction name="header_info" output="yes" access="remote">
		<cfinclude template="#application.g.s_path_handlers#/users/header_info.cfm">
	</cffunction>
</cfcomponent>