<cfcomponent name="Content"
	displayName="Content"
	extends="sys_Types"
	debug="yes">

<!--- 	<cffunction
		name="create"
		output="yes"
		access="remote">
	
		<cfargument name="typeid" required="no">
		
		<!--- copy arguments to local scope --->
		<cfset variables.arguments = arguments>

		<!--- include create handler --->
		<cfinclude template="#application.stCommon.path_handler_cfmap#/content/create.cfm">
		
		<!--- return any data --->
		<cfreturn data>
		
	</cffunction>
	
	<cffunction
		name="edit"
		output="yes"
		access="remote">
	
		<cfargument name="id" required="yes">
		
		<!--- copy arguments to local scope --->
		<cfset variables.arguments = arguments>

		<!--- include edit handler --->
		<cfinclude template="#application.stCommon.path_handler_cfmap#/content/edit.cfm">
		
		<!--- return any data --->
		<cfreturn data>
		
	</cffunction>
	
	<cffunction
		name="delete"
		output="yes"
		access="remote">
	
		<cfargument name="id" required="yes">
		
		<!--- copy arguments to local scope --->
		<cfset variables.arguments = arguments>

		<!--- include delete handler --->
		<cfinclude template="#application.stCommon.path_handler_cfmap#/content/delete.cfm">
		
		<!--- return any data --->
		<cfreturn data>
		
	</cffunction>
	
	<cffunction
		name="save"
		output="yes"
		access="remote">
	
		<cfargument name="stObject" required="yes">
		<cfargument name="typeid" required="yes">
		<cfargument name="id" required="no">
		
		<!--- copy arguments to local scope --->
		<cfset variables.arguments = arguments>

		<!--- include save handler --->
		<cfinclude template="#application.stCommon.path_handler_cfmap#/content/save.cfm">
		
		<!--- return any data --->
		<cfreturn data>
		
	</cffunction> --->
	
	
	<cffunction
		name="preview"
		output="yes"
		access="remote">
	
		<cfargument name="id" required="yes">
		<cfargument name="typeID" required="yes">
		<cfargument name="bProcess" required="no" default="0">
		<cfargument name="stObject" required="no" default="#structNew()#">
		<cfargument name="siteID" required="no" default="#session.stUser.currSiteID#">
		
		<!--- copy arguments to local scope --->
		<cfset variables.arguments = arguments>

		<!--- include create handler --->
		<cfinclude template="#application.stCommon.path_handler_cfmap#/content/preview.cfm">
		
		<!--- return any data --->
		<cfreturn data>
		
	</cffunction>
	
</cfcomponent>
