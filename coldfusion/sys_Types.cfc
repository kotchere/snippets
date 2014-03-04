<!----------------------------------------------------------------
Template: sys_Types.cfc

Date created: 02/19/2002

Type: Component

Description: The component containing all the functions for Object Types

Related files:

Revision History
	01; 09/16/2003; Teo Graca; added exception handling for application.stCommon not
		defined in structsGetHier.cfm calls from initApp.cfm
----------------------------------------------------------------->
<cfcomponent name="sys_Types"
	displayName="Object Type Component"
	debug="yes">

	<cffunction
		name="get"
		output="yes"
		access="remote"
		returntype="struct">

		<cfargument name="typeid" required="no">
		<cfargument name="id" required="yes">

		<!--- copy arguments to local scope --->
		<cfset variables.arguments = arguments>

		<!--- include get handler --->
		<cfinclude template="#application.stCommon.path_handler_cfmap#/sys_Types/get.cfm">

		<!--- return objectData --->
		<cfreturn stObject>

	</cffunction>

	<cffunction
		name="getMultiple"
		output="yes"
		access="remote"
		hint="Used to get objects of different types. lTypeIDs is required. Optionally
		can pass in specific objects to get in lObjectIDs. It returns and array of
		structures."
		returntype="array">

		<cfargument name="ltypeIDs" default="">
		<cfargument name="lObjectIDs" default="">
		<cfargument name="OrderBy" required="no" default="c_displayName">
		<cfargument name="OrderType" required="no" default="asc">
		<cfargument name="OrderMethod" required="no" default="TEXTNOCASE"
			hint="Options include 'TEXT','TEXTNOCASE' and 'NUMERIC'">
		<cfargument name="filterSQL" required="no" default="">
		<cfargument name="returnType" required="no" default="array">
		<cfargument name="bSecure" required="no" default="0">
		<cfargument name="lCategoryIDs" required="no" default="">
		<cfargument name="selectSQL" required="no" default="">
		<cfargument name="selectFields" required="no" default="">
		<cfargument name="fromSQL" required="no" default="">
		<cfargument name="extraSQL" required="no" default=""
			hint="Any SQL to place at the end of all the query">
		<cfargument name="numTopObjects" required="no" default=""
			hint="Will only return the top number or records, that number being specified by this argument">
		<cfargument name="stCommon" required="no" default="">
		<cfargument name="lSiteIDs" required="no" default="" hint="List of sites to filter objects by">
		<cfargument name="bIncludeGlobal" required="no" default="0"
			hint="Whether or not to include global objects in results. Only applies if sites are passed into lSiteIDs">

		<!--- copy arguments to local scope --->
		<cfset variables.arguments = arguments>

		<cfif StructKeyExists(application,"stCommon") AND StructKeyExists(application.stCommon,"stTypeNames2TypeIDs")>
			<cfset stCommon = application.stCommon>
		</cfif>

		<!--- include getMultiple handler --->
		<cfinclude template="#stCommon.path_handler_cfmap#/sys_Types/getMultiple.cfm">

		<!--- return objectData --->
		<cfreturn data>

	</cffunction>

	<cffunction
		name="getTypeID"
		output="yes"
		access="remote"
		hint="Used to get the typeID of a specific object"
		returntype="string">

		<cfargument name="id" required="yes">

		<!--- copy arguments to local scope --->
		<cfset variables.arguments = arguments>

		<!--- include getTypeID handler --->
		<cfinclude template="#application.stCommon.path_handler_cfmap#/sys_Types/getTypeID.cfm">

		<!--- return objectData --->
		<cfreturn data>

	</cffunction>

	<cffunction
		name="create"
		output="yes"
		access="remote"
		returntype="string">

		<!--- <cfargument name="typeid" required="no" default="#application.stCommon.stTypeNames2TypeIDs.Content#"> --->
		<cfargument name="typeid" required="no" default="#application.stCommon.stTypeNames2TypeIDs[ListLast(GetMetaData(this).Name,".")]#">
		<cfargument name="lCategoryIDs" required="no" default="#session.stUser.lCategoryIDs#">
		<cfargument name="bLock" required="no" default="1">
		<cfargument name="bTask" required="no" default="1">
		<cfargument name="bDraft" required="no" default="1">
		<cfargument name="bVersion" required="no" default="1">
		<cfargument name="globalDefault" required="no" default="0">
		<cfargument name="siteID" required="no" default="#session.stUser.currSiteID#">
		<cfargument name="approveRight" required="no" default="approveContent">
		<cfargument name="pickerHandler" required="no" default="sys_types/wiz_Picker.cfm">
		<cfargument name="lRights" required="No" default="#session.stUser.lRights#">

		<!--- copy arguments to local scope --->
		<cfset variables.arguments = arguments>

		<!--- include create handler --->
		<cfinclude template="#application.stCommon.path_handler_cfmap#/sys_Types/create.cfm">

		<!--- return any data --->
		<cfreturn data>

	</cffunction>

	<cffunction
		name="createItem"
		output="yes"
		access="remote"
		returntype="any">

		<cfargument name="typeid" required="no">
		<cfargument name="bProcess" required="no" default="0">
		<cfargument name="stObject" required="no" default="#structNew()#">
		<cfargument name="lCategoryIDs" required="no" default="">
		<cfargument name="siteID" required="no" default="#session.stUser.currSiteID#">
		<cfargument name="lRights" required="No" default="#session.stUser.lRights#">
		<cfargument name="stType" required="No" default="#structNew()#"
			hint="Pass in the type structure if it exists to avoid it being retrieved again">

		<!--- copy arguments to local scope --->
		<cfset variables.arguments = arguments>

		<!--- include createItem handler --->
		<cfinclude template="#application.stCommon.path_handler_cfmap#/sys_Types/createItem.cfm">

		<!--- return any data --->
		<cfreturn data>

	</cffunction>

	<cffunction
		name="edit"
		output="yes"
		access="remote"
		returntype="string">

		<!--- <cfargument name="typeid" required="no" default="#application.stCommon.stTypeNames2TypeIDs.Content#"> --->
		<cfargument name="typeid" required="no" default="#application.stCommon.stTypeNames2TypeIDs[ListLast(GetMetaData(this).Name,".")]#">
		<cfargument name="lCategoryIDs" required="no" default="#session.stUser.lCategoryIDs#">
		<cfargument name="bLock" required="no" default="1">
		<cfargument name="bTask" required="no" default="1">
		<cfargument name="bDraft" required="no" default="1">
		<cfargument name="bVersion" required="no" default="1">
		<cfargument name="bSequential" default="0">
		<cfargument name="startStep" required="no" default="1">
		<cfargument name="lastStep" required="no" default="0">
		<cfargument name="stData" required="no" default="#structNew()#">
		<cfargument name="globalDefault" required="no" default="0">
		<cfargument name="siteID" required="no" default="#session.stUser.currSiteID#">
		<cfargument name="approveRight" required="no" default="approveContent">
		<cfargument name="pickerHandler" required="no" default="sys_types/wiz_Picker.cfm">
		<cfargument name="lRights" required="No" default="#session.stUser.lRights#">

		<!--- copy arguments to local scope --->
		<cfset variables.arguments = arguments>

		<!--- include edit handler --->
		<cfinclude template="#application.stCommon.path_handler_cfmap#/sys_Types/edit.cfm">

		<!--- return any data --->
		<cfreturn data>

	</cffunction>

	<cffunction
		name="editItem"
		output="yes"
		access="remote"
		returntype="any">

		<cfargument name="id" required="yes" default="">
		<cfargument name="typeid" required="no">
		<cfargument name="bProcess" required="no" default="0">
		<cfargument name="stObject" required="no" default="#structNew()#">
		<cfargument name="lCategoryIDs" required="no" default="">
		<cfargument name="siteID" required="No" default="#session.stUser.currSiteID#">
		<cfargument name="lRights" required="No" default="#session.stUser.lRights#">
		<cfargument name="stType" required="No" default="#structNew()#"
			hint="Pass in the type structure if it exists to avoid it being retrieved again">

		<!--- copy arguments to local scope --->
		<cfset variables.arguments = arguments>

		<!--- include editItem handler --->
		<cfinclude template="#application.stCommon.path_handler_cfmap#/sys_Types/editItem.cfm">

		<!--- return any data --->
		<cfreturn data>

	</cffunction>

	<cffunction
		name="delete"
		output="yes"
		access="remote"
		returntype="string">

		<!--- <cfargument name="typeid" required="no" default="#application.stCommon.stTypeNames2TypeIDs.Content#"> --->
		<cfargument name="typeid" required="no" default="#application.stCommon.stTypeNames2TypeIDs[ListLast(GetMetaData(this).Name,".")]#">
		<cfargument name="bSearchFirst" required="no" default="1">
		<cfargument name="lCategoryIDs" required="no" default="#session.stUser.lCategoryIDs#">
		<cfargument name="globalDefault" required="no" default="0">
		<cfargument name="siteID" required="no" default="#session.stUser.currSiteID#">

		<!--- copy arguments to local scope --->
		<cfset variables.arguments = arguments>

		<!--- include delete handler --->
		<cfinclude template="#application.stCommon.path_handler_cfmap#/sys_Types/delete.cfm">

		<!--- return objectData --->
		<cfreturn data>

	</cffunction>

	<cffunction
		name="deleteItem"
		output="yes"
		returntype="string">

		<cfargument name="id" required="yes">
		<cfargument name="typeID" required="no" default="">
		<cfargument name="stObject" required="no" default="#structNew()#">
		<cfargument name="bCheckDependencies" required="no" default="1">
		<cfargument name="bCheckLocks" required="no" default="1">
		<cfargument name="bDeleteRelationships" required="no" default="1">
		<cfargument name="bDeleteFiles" required="no" default="1">
		<cfargument name="bDeleteTasks" required="no" default="1">
		<cfargument name="bDeleteVersions" required="no" default="1">
		<cfargument name="aSQL" required="no" default="#arrayNew(1)#">

		<!--- copy arguments to local scope --->
		<cfset variables.arguments = arguments>

		<!--- include deleteItem handler --->
		<cfinclude template="#application.stCommon.path_handler_cfmap#/sys_Types/deleteItem.cfm">

		<!--- return objectData --->
		<cfreturn data>

	</cffunction>

	<cffunction
		name="deleteMultiple"
		output="yes"
		returntype="string">

		<cfargument name="ltypeIDs" required="yes">
		<cfargument name="lObjectIDs" required="no" default="">
		<cfargument name="filterSQL" required="no" default="">
		<cfargument name="bDeleteRelationships" required="no" default="1">

		<!--- copy arguments to local scope --->
		<cfset variables.arguments = arguments>

		<!--- include deleteMultiple handler --->
		<cfinclude template="#application.stCommon.path_handler_cfmap#/sys_Types/deleteMultiple.cfm">

		<!--- return objectData --->
		<cfreturn data>

	</cffunction>

	<cffunction
		name="save"
		output="yes"
		returntype="string">

		<cfargument name="stObject" required="yes">
		<cfargument name="typeid" required="yes">
		<cfargument name="id" required="yes">
		<cfargument name="aSQL" required="no" default="#arrayNew(1)#">

		<!--- copy arguments to local scope --->
		<cfset variables.arguments = arguments>
<!--- <cfdump var="#variables.arguments#"><cfabort> --->
		<!--- include save handler --->
		<cfinclude template="#application.stCommon.path_handler_cfmap#/sys_Types/save.cfm">

		<!--- return objectData --->
		<cfreturn data>

	</cffunction>

	<cffunction
		name="PickerType"
		output="yes"
		access="remote"
		returntype="any">

		<cfargument name="typeid" required="yes">
		<cfargument name="bProcess" required="no" default="0">
		<cfargument name="stObject" required="no" default="#structNew()#">

		<!--- copy arguments to local scope --->
		<cfset variables.arguments = arguments>

		<!--- include pickerType handler --->
		<cfinclude template="#application.stCommon.path_handler_cfmap#/sys_Types/PickerType.cfm">

		<!--- return any data --->
		<cfreturn data>

	</cffunction>

	<cffunction
		name="PickerObject"
		output="yes"
		access="remote"
		returntype="any">

		<cfargument name="bProcess" required="no" default="0">
		<cfargument name="typeID" required="no" default="#application.stCommon.stTypeNames2TypeIDs.Content#">
		<cfargument name="stObject" required="no" default="#structNew()#">
		<cfargument name="bSecure" required="no" default="0">
		<cfargument name="lCategoryIDs" required="no" default="">
		<cfargument name="bSearchFirst" required="no" default="1">
		<cfargument name="inputType" required="no" default="radio">
		<cfargument name="bAllowGlobal" required="no" default="1">
		<cfargument name="globalDefault" required="no" default="0">
		<cfargument name="lSiteIDs" required="no" default="#session.stUser.currSiteID#">
		<cfargument name="title" required="no" default="#application.stCommon.stTypeIDs2TypeNames[typeID]# search">

		<!--- 4/26/06: daden: Added to allow us to pass through information to filter
			  out some things from what is displayed in the Picker --->
		<cfargument name="filterSQL" required="no" default="" />
		<!--- <cfdump var="#GetMetaData(this)#"> --->

		<!--- copy arguments to local scope --->
		<cfset variables.arguments = arguments>

		<!--- include pickerObject handler --->
		<cfinclude template="#application.stCommon.path_handler_cfmap#/sys_Types/PickerObject.cfm">

		<!--- return any data --->
		<cfreturn data>

	</cffunction>

	<cffunction
		name="PickerObjectPage"
		output="yes"
		access="remote"
		returntype="any">

		<cfargument name="bProcess" required="no" default="0">
		<cfargument name="stSelectedObjects" required="no" default="#structNew()#">
		<cfargument name="layout" required="no" default="onecolumn">
		<cfargument name="lCategoryIDs" required="no" default="#session.stUser.lCategoryIDs#">

		<!--- copy arguments to local scope --->
		<cfset variables.arguments = arguments>

		<!--- include pickerObjectPage handler --->
		<cfinclude template="#application.stCommon.path_handler_cfmap#/sys_Types/PickerObjectPage.cfm">

		<!--- return any data --->
		<cfreturn data>

	</cffunction>

	<cffunction
		name="PickerHier"
		output="yes"
		access="remote"
		returntype="any">

		<cfargument name="bProcess" required="no" default="0">
		<cfargument name="hierID" required="no" default="#application.stCommon.pageHierID#">
		<cfargument name="lAccessibleEdges" required="no" default="">
		<cfargument name="siteID" required="No" default="#session.stUser.currSiteID#">

		<!--- copy arguments to local scope --->
		<cfset variables.arguments = arguments>

		<!--- include pickerHier handler --->
		<cfinclude template="#application.stCommon.path_handler_cfmap#/sys_Types/PickerHier.cfm">

		<!--- return any data --->
		<cfreturn data>

	</cffunction>

	<cffunction
		name="PickerHierMultiple"
		output="yes"
		access="remote"
		returntype="any">

		<cfargument name="bProcess" required="no" default="0">
		<cfargument name="hierID" required="no" default="#application.stCommon.pageHierID#">
		<cfargument name="text" required="no" default="">
		<cfargument name="bRequired" required="no" default="0">

		<!--- copy arguments to local scope --->
		<cfset variables.arguments = arguments>

		<!--- include pickerHier handler --->
		<cfinclude template="#application.stCommon.path_handler_cfmap#/sys_Types/pickerHierMultiple.cfm">

		<!--- return any data --->
		<cfreturn data>

	</cffunction>

	<cffunction
		name="PickerObjectMultiple"
		output="yes"
		access="remote"
		returntype="any">

		<cfargument name="lTypeIDs" required="yes">
		<cfargument name="bProcess" required="no" default="0">
		<cfargument name="stObject" required="no" default="#structNew()#">
		<cfargument name="bErrorChecking" required="no" default="1">
		<cfargument name="bSecure" required="no" default="0">
		<cfargument name="title" required="no" default="">
		<cfargument name="bIncludeGlobal" required="no" default="1">
		<cfargument name="lSiteIDs" required="no" default="#session.stUser.currSiteID#">
		<cfargument name="label" required="No" default="Assigned Items">
		<cfargument name="availableLabel" required="No" default="Available Items">
		<cfargument name="assignedLabel" required="No" default="Currently Assigned Items">
		<cfargument name="instanceName" required="No" default="pickerObjectMul">

		<!--- copy arguments to local scope --->
		<cfset variables.arguments = arguments>

		<!--- include pickerObjectMultiple handler --->
		<cfinclude template="#application.stCommon.path_handler_cfmap#/sys_Types/PickerObjectMultiple.cfm">

		<!--- return any data --->
		<cfreturn data>

	</cffunction>

	<cffunction
		name="preview"
		output="yes"
		access="remote"
		returntype="string">

		<cfargument name="id" required="yes">
		<cfargument name="typeID" required="yes">
		<cfargument name="bProcess" required="no" default="0">
		<cfargument name="stObject" required="no" default="#structNew()#">
		<cfargument name="stData" required="no" default="#structNew()#">

		<!--- copy arguments to local scope --->
		<cfset variables.arguments = arguments>

		<!--- include preview handler --->
		<cfinclude template="#application.stCommon.path_handler_cfmap#/sys_Types/preview.cfm">


		<!--- return any data --->
		<cfreturn data>

	</cffunction>

	<cffunction
		name="invokeMethod"
		output="yes"
		access="remote"
		returntype="any">

		<cfargument name="method2invoke" required="yes">
		<cfargument name="lIDs" required="no" default="" hint="If lIDs is not passed in the aObjects should be">
		<cfargument name="delimiter" required="no" default="<br>">
		<cfargument name="aObjects" required="no" default="#arrayNew(1)#"
			hint="if aObjects is not passed in then lIDs should be">

		<!--- copy arguments to local scope --->
		<cfset variables.arguments = arguments>

		<!--- include invokeMethod handler --->
		<cfinclude template="#application.stCommon.path_handler_cfmap#/sys_Types/invokeMethod.cfm">


	</cffunction>

	<cffunction
		name="lock"
		output="yes"
		access="remote"
		returntype="struct">

		<cfargument name="id" required="yes">
		<cfargument name="typeID" required="yes">
		<cfargument name="stObject" required="no" default="#structNew()#">

		<!--- copy arguments to local scope --->
		<cfset variables.arguments = arguments>

		<!--- include lock handler --->
		<cfinclude template="#application.stCommon.path_handler_cfmap#/sys_Types/lock.cfm">

		<!--- return lock status --->
		<cfreturn data>

	</cffunction>

	<cffunction
		name="unLock"
		output="yes"
		access="remote"
		returntype="struct">

		<cfargument name="id" required="yes">
		<cfargument name="typeID" required="yes">
		<cfargument name="stObject" required="no" default="#structNew()#">

		<!--- copy arguments to local scope --->
		<cfset variables.arguments = arguments>

		<!--- include unLock handler --->
		<cfinclude template="#application.stCommon.path_handler_cfmap#/sys_Types/unLock.cfm">

		<!--- return lock status --->
		<cfreturn data>

	</cffunction>

	<cffunction
		name="getObjectDependencies"
		output="yes"
		access="remote"
		returntype="struct">

		<cfargument name="id" required="yes">
		<cfargument name="stObject" required="no" default="#structNew()#">
		<cfargument name="bCheckLocks" required="no" default="1">
		<cfargument name="bCheckRelationships" required="no" default="1">
		<cfargument name="bCheckFiles" required="no" default="1">
		<cfargument name="bCheckTasks" required="no" default="1">
		<cfargument name="bCheckVersions" required="no" default="1">
		<cfargument name="siteID" required="no" default="#session.stUser.currSiteID#">

		<!--- copy arguments to local scope --->
		<cfset variables.arguments = arguments>

		<!--- include getObjectDependencies handler --->
		<cfinclude template="#application.stCommon.path_handler_cfmap#/sys_Types/getObjectDependencies.cfm">

		<!--- return lock status --->
		<cfreturn data>

	</cffunction>

	<cffunction
		name="init"
		output="yes"
		access="remote"
		returntype="struct">

		<!--- Either typeID or ID must be passed. If TypeID is passed, then we
		use that; if ID is passed and TypeID is not, then find out the TypeID
		from the ID and use that Type. --->
		<cfargument name="typeid" required="no" default="">
		<cfargument name="id" required="no" default="">
		<cfargument name="stType" required="no" default="">

		<!--- copy arguments to local scope --->
		<cfset variables.arguments = arguments>

		<!--- include get handler --->
		<cfinclude template="#application.stCommon.path_handler_cfmap#/sys_Types/init.cfm">

		<!--- return objectData --->
		<cfreturn data>

	</cffunction>


</cfcomponent>