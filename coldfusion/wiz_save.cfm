<cfsetting enablecfoutputonly="Yes">
<!----------------------------------------------------------------
Template: wiz_save.cfm

Date created: 04/25/2002

Type: Wizard Handler

Description: Invokes the save method

Related files:

Revision History
	01; mm/dd/yyyy; author; actions
----------------------------------------------------------------->
<cfset objTypeID = stWizard.stData.Picker.typeID>
<cfset objectID = stWizard.stData.Picker.id>
<cfset typeName = application.stCommon.stTypeIDs2TypeNames[objtypeID]>

<!--- output error msg if user is trying to edit a type --->
<cfif objTypeID EQ 0 AND stWizard.method EQ "edit">
	<cfmodule template="#application.stCommon.path_customtag_cfmap#/error.cfm"
		error="custom"
		label="Editing Types Not Implemented"
		message="Editing types is not fully implemented.<br>Please contact the system administrator for more info"
	/>
	<cfabort>
</cfif>

<!--- if creating a type then make sure parentID is in stObject --->
<cfif objTypeID EQ 0>
	<cfset stWizard.stData.edit.parentID = stWizard.stData.picker.parentID>
</cfif>

<!--- ** NOTE: if we intend on giving some users the right to ignore locks then this code will have to be
changed to do a lock before writing to the db or task object and then unlock afterwards --->
<!--- **NOTE: task is done before unlocking on exit unlike when we enter where lock is done before task.
This way we avoid the chance of a user coming in to edit the object in between the current user unlocking it
and saving it --->

<!--- START Task code ------------------------------------------------------------>
<cfset bContinue = 1>
<cfset bSaveObject = 1>
<cfif application.stCommon.task_bEnable AND stWizard.bTask AND objtypeID NEQ 0
	AND application.stMultiSite[stWizard.siteID].appSettings.task_bEnable>

	<cfset categoryID = "">
	<cfif len(stWizard.lCategoryIDs)>
		<cfset categoryID = stWizard.stData.edit.category>
	</cfif>
	<cfif NOT isDefined("stWizard.stData.edit.title")>
		<cfif isDefined("stWizard.stData.edit.c_name")>
			<cfset stWizard.stData.edit.title = stWizard.stData.edit.c_name>
		<cfelseif isDefined("stWizard.stData.edit.name")>
			<cfset stWizard.stData.edit.title = stWizard.stData.edit.name>
		</cfif>
	</cfif>
	
	<cfif isDefined("stWizard.stData.edit.title")>
		<cfset lbl = stWizard.stData.edit.title>
	<cfelseif isDefined("stWizard.stData.edit.c_name")>
		<cfset lbl = stWizard.stData.edit.c_name>
	<cfelseif isDefined("stWizard.stData.edit.name")>
		<cfset lbl = stWizard.stData.edit.name>
	</cfif>
	
	<!--- update task --->
	<cfinvoke component="#application.stCommon.path_components#.task"
		method="update"
		type="Content"
		label="#lbl#"
		artifactID="#objectID#"
		categoryID="#categoryID#"
		stWizardData="#stWizard.stData#"
		objectField="edit"
		siteID="#stWizard.siteid#"
		approveRight="#stWizard.approveRight#"
		returnVariable="stTask">
	
	<cfif NOT stTask.bSuccess>
		<cfoutput><span class="errorText">#stTask.message#</span></cfoutput>
		<cfset rdata = "error">
		<cfset bContinue = 0>
		<!--- unlock object --->
		<cfinvoke component="#application.stCommon.path_components#.sys_Types"
			method="unLock"
			typeid="#objtypeID#"
			id="#objectID#"
			returnVariable="stLock">
	<cfelseif len(stTask.taskID)>
		<!--- if there is a taskID then that means a task was created/updated so we don't create/update the object --->
		<cfset bSaveObject = 0>
	</cfif>
	
</cfif>
<!--- / END Task code ------------------------------------------------------------>

<!--- START locking code --------------------------------------------------------->
<cfif bContinue>

	<cfif application.stCommon.lock_bEnable AND stWizard.bLock AND len(objectID)
		AND application.stMultiSite[stWizard.siteID].appSettings.lock_bEnable>
		
		<!--- attempt to unlock --->
		<cfinvoke component="#application.stCommon.path_components#.sys_Types"
			method="unLock"
			typeid="#objtypeID#"
			id="#objectID#"
			returnVariable="stLock"
			>
			
		<cfif NOT stLock.bSuccess>
			<cfoutput><span class="errorText">#stLock.message#</span></cfoutput>
			<cfset rdata = "error">
			<cfset bContinue = 0>
		</cfif>
	</cfif>
</cfif>
<!--- / END Locking code --------------------------------------------------------->

<!--- save if no locking or workflow errors were encountered --->
<cfif bContinue AND bSaveObject>
	
	<!--- if able to clear lock then save object --->
	<cfinvoke component="#application.stCommon.path_components#.#typeName#"
		method="save"
		id="#objectID#"
		typeid="#objtypeID#"
		stObject="#stWizard.stData.edit#"
		returnVariable="objID">
	
	<cfif objtypeID NEQ 0 AND len(stWizard.lCategoryIDs)>
		<!--- create relationship to category --->
		<cfinvoke component="#application.stCommon.path_components#.Relationship"
			method="update"
			fromID="#objID#"
			lToIDs="#stWizard.stData.edit.category#"
			relationshipType="content2category"
		>
	</cfif>
	
	<!--- update object's global status --->
	<cfif structKeyExists(stWizard.stData.edit,"c_bglobal")>
		<cfset bNewObject = 1>
		<cfif len(objectID)>
			<cfset bNewObject = 0>
		</cfif>
		<cfmodule template="#application.stCommon.path_customtag_cfmap#/globalStatusUpdate.cfm"
			bNewObject="#bNewObject#"
			id="#objID#"
			typeID="#objtypeID#"
			bGlobal="#stWizard.stData.edit.c_bglobal#"
			siteID="#stWizard.siteID#"
		/>
	</cfif>
	
	<!--- Now update the object's version history --->
	<cfif stWizard.bVersion>
		<cfinvoke component="#application.stCommon.path_components#.version"
			method="update"
			artifactID="#objID#"
			stData="#stWizard.stData#"
			objectField="edit"
			typeID="#stWizard.stData.picker.typeid#"
			siteID="#stWizard.siteID#">
	</cfif>
	
</cfif>

	
<cfsetting enablecfoutputonly="No">