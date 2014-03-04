<cfinvoke component="#application.stCommon.path_components#.sys_Types"
	method="getMultiple"
	ltypeIDs="#application.stCommon.stTypeNames2TypeIDs.users#"
	returnVariable="aUsers">

<cfset selected = "">
<cfoutput>
	<br />
	<table SUMMARY="This table is for layout"  cellspacing="1" cellpadding="3" width="100%" align="center">
		<tr>
			<td width="20%" valign="top"><strong>Assign Task To</strong></td>
			<td width="80%">
				<select name="stObject.assigneeCurrent">
					<option value="">Please Select Assignee</option>
					<cfloop from="1" to="#ArrayLen(aUsers)#" index="i">
						<cfif isDefined("stWizard.stData.edit.assigneeCurrent") AND stWizard.stData.edit["assigneeCurrent"] IS aUsers[i].ID>
							<cfset selected = " selected">
						</cfif>
						<option value="#aUsers[i].ID#"#selected#>#aUsers[i].email#</option>
					</cfloop>
				</select>
				<br /><br />
				Email<br />
				<input type="text" value="" />
				<!--- <table cellspacing="1" cellpadding="3">
					<tr>
						<td colspan="3">
							<strong>All fields are required</strong>
						</td>
					</tr>
					<tr>
						<td>
							First Name<br />
							<input type="text" value="" />
						</td>
						<td>
							Last Name<br />
							<input type="text" value="" />
						</td>
						<td>
							Email<br />
							<input type="text" value="" />
						</td>
					</tr>
				</table> --->
			</td>
		</tr>
	</table>
</cfoutput>