<cfsetting enablecfoutputonly="Yes">
<cfset objectID = stWizard.stData.Picker.id>
<cfset objtypeID = application.stCommon.stTypeNames2TypeIDs.tasker>


<!--- START locking code --------------------------------------------------------->
<cfset bContinue = 1>
<cfif application.stCommon.lock_bEnable AND len(objectID)
	AND application.stMultiSite[stWizard.siteID].appSettings.lock_bEnable>

	<!--- attempt to unlock --->
	<cfinvoke component="#application.stCommon.path_components#.sys_Types"
		method="unLock"
		typeid="#application.stCommon.stTypeNames2TypeIDs.tasker#"
		id="#objectID#"
		returnVariable="stLock">

	<cfif NOT stLock.bSuccess>
		<cfoutput><span class="errorText">#stLock.message#</span></cfoutput>
		<cfset rdata = "error">
		<cfset bContinue = 0>
	</cfif>
</cfif>
<!--- / END Locking code --------------------------------------------------------->

<cfif bContinue>

	<!--- Put all the data into a single structure  --->
	<cfset stData = StructNew() />
	<cfif StructKeyExists(stWizard.stData,"edit") >
		<cfset StructAppend(stData,stWizard.stData.edit) />
	</cfif>
	<cfif StructKeyExists(stWizard.stData,"attachments") >
		<cfset StructAppend(stData,stWizard.stData.attachments) />
	</cfif>
	<cfif StructKeyExists(stWizard.stData,"clearance") >
		<cfset StructAppend(stData,stWizard.stData.clearance) />
	</cfif>
	
	<cfset tempAssigneeComplete = "">


	<!--- create assignee complete list --->
	<cfif NOT Len(objectID)>
		<cfif Len(stData.assigneeCurrent)>
			<cfset stData.assigneesComplete = "0">
			<cfset stData.assignees = stData.assigneeCurrent>
		</cfif>
	<cfelse>
		<cfparam name="stData.assigneesComplete" default="">
		<cfparam name="stWizard.origData.assigneesComplete" default="">
		<cfset tempAssigneeComplete = stData.assigneesComplete>
		<!--- assign original complete list to current complete list --->
		<cfset stData.assigneesComplete = stWizard.origData.assigneesComplete>

		<cfif Len(stData.assigneeCurrent)>
			<cfset stData.assigneesComplete = ListAppend(stWizard.origData.assigneesComplete,0)>
			<cfset stData.assignees = ListAppend(stWizard.origData.assignees,stData.assigneeCurrent)>
		<cfelse>
			<cfif Len(stWizard.origData.tempAssigneeCurrent)>
				<cfset stData.assigneeCurrent = stWizard.origData.tempAssigneeCurrent>
			</cfif>
		</cfif>
	</cfif>

	<!--- if current assignee was marked complete... --->
	<cfif tempAssigneeComplete IS "yes">
		<cfset index = ListFind(stData.assignees,stData.assigneeCurrent)>
		<cfif index>
			<cfset stData.assigneesComplete = ListSetAt(stData.assigneesComplete,index,"1")>
		</cfif>
	</cfif>

	<!--- get new current assignee --->
	<cfset stData.assigneeCurrent = "">
	<cfif Len(stData.assignees)>
		<cfloop from="1" to="#ListLen(stData.assignees)#" index="i">
			<cfif ListGetAt(stData.assigneesComplete,i) IS "0">
				<cfset stData.assigneeCurrent = ListGetAt(stData.assignees,i)>
			</cfif>
		</cfloop>
	</cfif>

	<!--- assign current assignee's organization to tasker --->
	<cfif Len(stData.assigneeCurrent)>
		<cfinvoke component="#application.stCommon.path_components#.sys_Types"
			method="get"
			id="#stData.assigneeCurrent#"
			returnVariable="stUsrOrg">
		<cfif StructKeyExists(stUsrOrg,"organization")>
			<cfset stData.organization = stUsrOrg.organization>
		</cfif>
	</cfif>

	<!--- <cfif Len(stData.assigneeCurrent)>
		<cfset stData.assigneesComplete = ListAppend(stData.assigneesComplete,"0")>
	</cfif> --->



	<!--- store comments in new variable and delete from stData --->
	<cfset comments = "">
	<cfif StructKeyExists(stData,"comments")>
		<cfset comments = stData.comments>
	</cfif>
	<cfset stData.comments = "">

	<!--- get assignee current's data --->
	<cfif Len(stData.assigneeCurrent) AND session.stUser.ID IS NOT stData.assigneeCurrent>
		<cfinvoke component="#application.stCommon.path_components#.sys_Types"
			method="getMultiple"
			lObjectIDs="#stData.assigneeCurrent#"
			ltypeIDs="#application.stCommon.stTypeNames2TypeIDs.users#"
			returnVariable="aUser">

		<!--- email current assignee --->
		<cfif ArrayLen(aUser)>
			<cfset toUser = aUser[1].firstName & " " & aUser[1].lastName>
			<cfset toUserEmail = aUser[1].email>
			<cfset taskerName = stData.name>
			<cfset taskerDescription = stData.description>
			<cfset bTaskerCompleted = false>
			<cfif FindNoCase("complete", stWizard.stCategory[stData.category])>
				<cfset bTaskerCompleted = true>
			</cfif>
			<!--- <cfinclude template="#application.stCommon.path_admin_cfmap#/mail/taskernotify.cfm"> --->
		</cfif>
	</cfif>


	<!--- format due dates --->
	<cfscript>
		function fDate(daDate) {
			if(ListLen(daDate) AND isDate(ListGetAt(daDate,1))) {
				if(ListLen(daDate) LT 4) {
					daDate = ListGetAt(daDate,1) & ",12,0,PM";
				}
				daDate = "#ListGetAt(daDate,1)# #ListGetAt(daDate,2)#:#ListGetAt(daDate,3)#:00 #ListGetAt(daDate,4)#";
			}
			else {
				daDate = "";
			}
			return daDate;
		}
	</cfscript>

	<cfif StructKeyExists(stData,"dueDate")>
		<cfset stData.dueDate = fDate(stData.dueDate)>
	</cfif>
	<cfif StructKeyExists(stData,"origDueDate")>
		<cfset stData.origDueDate = fDate(stData.origDueDate)>
	</cfif>


	<!--- make sure objID is reset --->
	<cfset objID = "">
	<!--- save tasker --->
	<cfinvoke component="#application.stCommon.path_components#.sys_Types"
		method="save"
		id="#objectID#"
		stObject="#stData#"
		typeID="#application.stCommon.stTypeNames2TypeIDs.tasker#"
		returnVariable="objID">

	<!--- Make relationship from Tasker to its category(ies) --->
	<cfif objtypeID NEQ 0 AND StructKeyExists(stWizard.stData,"edit") AND StructKeyExists(stWizard.stData.edit,"category")>

		<!--- create relationship to category --->
		<cfmodule template="#application.stCommon.path_customtag_cfmap#/relateGlobalLocal.cfm"
			fromID="#objID#"
			lToIDs="#stWizard.stData.edit.category#"
			relationshipType="content2category"
			siteID="#session.stUser.currSiteID#"
		 />
	</cfif>

	<!--- save comment in comments object --->
	<cfset stComments = StructNew()>
	<cfset stComments.fromID = objID>
	<cfset stComments.comments = comments>
	<cfset stComments.name = "tasker comment">
	<cfset stComments.c_name = stComments.name>
	<cfif Len(trim(comments))>
		<!--- get last comment sequence num --->
		<cfinvoke component="#application.stCommon.path_components#.sys_Types"
			method="getMultiple"
			lTypeIDs="#application.stCommon.stTypeNames2TypeIDs.Comments#"
			filterSQL="fromID = #objID#"
			orderBy="c_sequence"
			orderMethod="numeric"
			returnVariable="aComments">

		<cfset commentsSequence = 0>
		<cfif ArrayLen(aComments)>
			<!--- get last sequence number and increment by 1 --->
			<cfset commentsSequence = aComments[ArrayLen(aComments)].c_sequence + 1>
		</cfif>
		<cfset stComments.c_sequence = commentsSequence>

		<!--- save comment --->
		<cfinvoke component="#application.stCommon.path_components#.sys_Types"
			method="save"
			id=""
			stObject="#stComments#"
			typeID="#application.stCommon.stTypeNames2TypeIDs.comments#"
			returnVariable="commentsID">
	</cfif>

	<!--- get previous reports/logs --->
	<cfinvoke component="#application.stCommon.path_components#.sys_Types"
		method="getMultiple"
		lTypeIDs="#application.stCommon.stTypeNames2TypeIDs.Log#"
		filterSQL="fromID = #objID#"
		orderBy="c_sequence"
		orderMethod="numeric"
		returnVariable="aLog">

	<cfset logSequence = 0>
	<cfif ArrayLen(aLog)>
		<!--- get last sequence number and increment by 1 --->
		<cfset logSequence = aLog[ArrayLen(aLog)].c_sequence + 1>
	</cfif>

	<!--- save report/log --->
	<cfset stLog = StructNew()>
	<cfwddx action="cfml2wddx" input="#stData#" output="stLog.contents">
	<!--- <cfset stLog.contents = stWizard.stData.edit> --->
	<cfset stLog.fromID = objID>
	<cfset stLog.name = "tasker log">
	<cfset stLog.c_name = stLog.name>
	<cfset stLog.c_sequence = logSequence>
	<cfif len(objectID)>
		<cfset stLog.description = "Assigned">
	<cfelse>
		<cfset stLog.description = "Created">
	</cfif>

	<!--- if task owner marks the task as complete... --->
	<cfif StructKeyExists(stWizard,"bTaskOwner") AND stWizard.bTaskOwner
		AND StructKeyExists(stWizard.stData.edit,"complete") AND stWizard.stData.edit.complete>
		<cfset stLog.description = "Completed">
	</cfif>

	<cfinvoke component="#application.stCommon.path_components#.sys_Types"
		method="save"
		id=""
		stObject="#stLog#"
		typeID="#application.stCommon.stTypeNames2TypeIDs.Log#"
		returnVariable="logID">

	<!--- update object's global status --->
<!--- 	<cfif structKeyExists(stWizard.stData,"c_bglobal")> --->
		<cfset bNewObject = 1>
		<cfif len(objectID)>
			<cfset bNewObject = 0>
		</cfif>
		<cfmodule template="#application.stCommon.path_customtag_cfmap#/globalStatusUpdate.cfm"
			bNewObject="#bNewObject#"
			id="#objID#"
			typeID="#objtypeID#"
			bGlobal="0"
			siteID="#stWizard.siteID#"
		/>
<!--- 	</cfif> --->



</cfif>

<cfsetting enablecfoutputonly="No">