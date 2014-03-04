<cfcomponent name="wwsTools"
	displayName="WWS Tools"
	extends="sys_Types"
	debug="yes">

	<cffunction
		name="create"
		output="yes"
		access="remote">
	
		<cfargument name="typeid" required="no" default="#application.stCommon.stTypeNames2TypeIDs.wwsTools#">
		
		<!--- copy arguments to local scope --->
		<cfset variables.arguments = arguments>

		<!--- include create handler --->
		<cfinclude template="#application.stCommon.path_handler_cfmap#/wwsTools/create.cfm">
	
		<!--- return any data --->
		<cfreturn data>
	</cffunction>
	
	<cffunction
		name="edit"
		output="yes"
		access="remote">
	
		<cfargument name="typeid" required="no" default="#application.stCommon.stTypeNames2TypeIDs.wwsTools#">
		
		<!--- copy arguments to local scope --->
		<cfset variables.arguments = arguments>

		<!--- include edit handler --->
		<cfinclude template="#application.stCommon.path_handler_cfmap#/wwsTools/edit.cfm">
	
		<!--- return any data --->
		<cfreturn data>
	</cffunction>
	
	<cffunction
		name="delete"
		output="yes"
		access="remote">
	
		<cfargument name="typeid" required="no" default="#application.stCommon.stTypeNames2TypeIDs.wwsTools#">
		<cfargument name="bSearchFirst" required="no" default="1">
		<cfargument name="lCategoryIDs" required="no" default="">
		
		<!--- copy arguments to local scope --->
		<cfset variables.arguments = arguments>

		<!--- include delete handler --->
		<cfinclude template="#application.stCommon.path_handler_cfmap#/wwsTools/delete.cfm">
	
		<!--- return any data --->
		<cfreturn data>
	</cffunction>
	
	<cffunction
		name="preview"
		output="yes"
		access="remote">
	
		<cfargument name="id" required="yes">
		<cfargument name="typeID" required="yes">
		<cfargument name="bProcess" required="no" default="0">
		<cfargument name="stObject" required="no" default="#structNew()#">
		
		<!--- copy arguments to local scope --->
		<cfset variables.arguments = arguments>

		<!--- include preview handler --->
		<cfinclude template="#application.stCommon.path_handler_cfmap#/wwsTools/preview.cfm">
	
		<!--- return any data --->
		<cfreturn data>
	</cffunction>
	
	<cffunction
		name="createType"
		output="yes"
		access="remote">

<!--- 		<cfargument name="typeid" required="no" default="#application.stCommon.stTypeNames2TypeIDs[ListLast(GetMetaData(this).Name,".")]#">
		<cfargument name="bLock" required="no" default="1">
		<cfargument name="bTask" required="no" default="1">
		<cfargument name="bSequential" default="0">
		<cfargument name="startStep" required="no" default="1">
		<cfargument name="lastStep" required="no" default="0">
		<cfargument name="stData" required="no" default="#structNew()#">
		<cfargument name="globalDefault" required="no" default="0">
		<cfargument name="siteID" required="no" default="#session.stUser.currSiteID#">
		<cfargument name="approveRight" required="no" default="approve#ListLast(GetMetaData(this).Name,".")#"> --->
		
		<!--- copy arguments to local scope --->
		<cfset variables.arguments = arguments>

		<!--- include createType handler --->
		<cfinclude template="#application.stCommon.path_handler_cfmap#/wwsTools/createtype.cfm">
	
		<!--- return any data --->
		<cfreturn data>
	</cffunction>
	
	<cffunction
		name="editType"
		output="yes"
		access="remote">
	
		<!--- copy arguments to local scope --->
		<cfset variables.arguments = arguments>

		<!--- include editType handler --->
		<cfinclude template="#application.stCommon.path_handler_cfmap#/wwsTools/edittype.cfm">
	
		<!--- return any data --->
		<cfreturn data>
	</cffunction>
	
	<cffunction
		name="deleteType"
		output="yes"
		access="remote">
	
		<cfargument name="id" required="yes">
		
		<!--- copy arguments to local scope --->
		<cfset variables.arguments = arguments>

		<!--- include deleteType handler --->
		<cfinclude template="#application.stCommon.path_handler_cfmap#/wwsTools/deletetype.cfm">
	
		<!--- return any data --->
		<cfreturn data>
	</cffunction>
	
	<cffunction
		name="manageTypes"
		output="yes"
		access="remote">
	
		<cfargument name="id" required="yes">
		
		<!--- copy arguments to local scope --->
		<cfset variables.arguments = arguments>

		<!--- include manageTypes handler --->
		<cfinclude template="#application.stCommon.path_handler_cfmap#/wwsTools/manageTypes.cfm">
	
		<!--- return any data --->
		<cfreturn data>
	</cffunction>
	
	<cffunction
		name="secureTypes"
		output="yes"
		access="remote">
	
		<!--- copy arguments to local scope --->
		<cfset variables.arguments = arguments>

		<!--- include secureTypes handler --->
		<cfinclude template="#application.stCommon.path_handler_cfmap#/wwsTools/secureTypes.cfm">
		
		<!--- return any data --->
		<cfreturn data>
	</cffunction>
	
	<cffunction
		name="devTools"
		output="yes"
		access="remote">
	
		<!--- copy arguments to local scope --->
		<cfset variables.arguments = arguments>

		<!--- include devTools handler --->
		<cfinclude template="#application.stCommon.path_handler_cfmap#/wwsTools/devTools.cfm">
	
		<!--- return any data --->
		<cfreturn data>
	</cffunction>
</cfcomponent>
