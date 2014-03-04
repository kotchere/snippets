<cfsetting enablecfoutputonly="Yes">
<!----------------------------------------------------------------
Template: crud.cfm

Date created: 08/10/2011

Type: Template

Description: 

Related files:
----------------------------------------------------------------->
<!--- copy arguments to local scope --->
<cfset arguments = variables.arguments>
<cfloop collection="#arguments#" item="key">
	<cfset temp = SetVariable(key,arguments[key])>
</cfloop>

<cfparam name="l_button_names" default="">
<cfparam name="l_button_links" default="">
<cfparam name="b_tooltip" default="false">


<cfif Len(s_tooltip) AND ListLen(l_tooltip_fields)>
	<cfset b_tooltip = true>
	<cfif Len(s_id)>
		<cfquery datasource="#application.g.ds#" name="qTool">
			SELECT * FROM TT WHERE TT_SECTION_ID = '#s_id#' AND TT_SECTION = '#s_tooltip#'
		</cfquery>
		<cfset st_tool = StructNew()>
		<cfloop query="qTool">
			<cfset st_tool[qTool.tt_field] = qTool.tt_description>
		</cfloop>
	</cfif>
</cfif>

<cfoutput>
	<div class="frm"><form name="frm_list" id="frm_list" method="post"><table width="100%">
</cfoutput>

<cfswitch expression="#s_action#">
	<!--- READ/LIST --->
	<cfcase value="read">
		<cfquery datasource="#application.g.ds#" name="qList">
			SELECT * FROM #s_table#
		</cfquery>

		<!--- output headers --->
		<cfoutput>			
			<col width="20"/>
			<col width="20"/>
			<tr>
				<th>&nbsp;</th>
				<th>&nbsp;</th>
				<cfloop list="#l_app_columns#" index="s_column">
					<th>#s_column#</th>
				</cfloop>
			</tr>
		</cfoutput>

		<!--- output cells --->
		<cfset i = 1>
        
		<cfloop query="qList">
			<cfoutput>
				<tr>
					<td>#i#</td>
					<td><em class="del" lnk="#application.g.s_path_base#/index.cfm/#request.s_page#/delete/#qList[s_id_column][i]#"></em></td>
                    <cfset i_col = 1>
					<cfloop list="#l_db_columns#" index="s_column">
                    	<cfset s_value = qList[s_column][i]>
                    	<!--- get type of db column --->
                        <cfif ListGetAt(l_app_ui, i_col) IS "radio">
                        	<cfif NOT Len(qList[s_column][i]) OR qList[s_column][i] IS 0>
                            	<cfset s_value = "no">
                            <cfelse>
                            	<cfset s_value = "YES">
                            </cfif>
                        </cfif>
						<td>
							<a href="#application.g.s_path_base#/index.cfm/#request.s_page#/show/#qList[s_id_column][i]#">#s_value#</a>
							<cfif isDefined("st_expand")>
								<cfset id_row = qList[s_id_column][i]>
								<cfif StructKeyExists(st_expand, id_row)>
									<br><span class="shide_title" s_id="#request.s_page#_#id_row#">#s_expand#</span>
									<div id="#request.s_page#_#id_row#" style="display:none">
										<cfloop from="1" to="#ArrayLen(st_expand[id_row])#" index="z">
											#st_expand[id_row][z]#<br>
										</cfloop>
									</div>
								</cfif>
							</cfif>
						</td>
                        <cfset i_col = i_col + 1>
					</cfloop>
				</tr></cfoutput>
			<cfset i = i + 1>
		</cfloop>
		
		<cfif b_buttons_list>
			<cfset l_button_names = "Add New">
			<cfset l_button_links = "#application.g.s_path_base#/index.cfm/#request.s_page#/show">
		</cfif>
	</cfcase>
	
	<!--- DELETE --->
	<cfcase value="delete">
		<cfquery datasource="#application.g.ds#" name="qDelete">
			DELETE FROM #s_table# WHERE #s_id_column# = '#s_id#'
		</cfquery>
		
		<cfquery datasource="#application.g.ds#" name="qDTT">
			DELETE FROM TT WHERE TT_SECTION_ID = '#s_id#' AND TT_SECTION = '#s_tooltip#'
		</cfquery>
		
		<cflocation url="#application.g.s_path_base#/index.cfm/#request.s_page#">
	</cfcase>
	
	<!--- SHOW RECORD --->
	<cfcase value="show">
		<cfif Len(s_id)>
			<cfquery datasource="#application.g.ds#" name="qRec">
				SELECT * FROM #s_table# WHERE #s_id_column# = '#s_id#'
			</cfquery>
			<cfif qRec.recordCount>
				<cfset l_button_names = "Update,Cancel">
				<cfset l_button_links = "javascript:document.frm_list.action= '#application.g.s_path_base#/index.cfm/#request.s_page#/update/#s_id#';document.frm_list.submit(),#application.g.s_path_base#/index.cfm/#request.s_page#">
			</cfif>
		<cfelse>
			<cfset l_button_names = "Add,Cancel">
			<cfset l_button_links = "javascript:document.frm_list.action= '#application.g.s_path_base#/index.cfm/#request.s_page#/create';document.frm_list.submit(),#application.g.s_path_base#/index.cfm/#request.s_page#">
		</cfif>
		<cfset i = 1>
		<cfloop list="#l_app_columns#" index="s_key">
			<cfset s_type = ListGetAt(l_app_ui, i)>
			<cfset s_db_column = ListGetAt(l_db_columns, i)>
			<cfoutput>
				<col width="20%"/>
				<col width="80%"/>
			</cfoutput>
			<cfoutput><tr></cfoutput>
				<cfoutput><td>#s_key#</td></cfoutput>
				<cfoutput><td></cfoutput>
					<!--- TEXTBOX --->
					<cfif s_type IS "text">
						<cfset s_tmp_value = "">
						<cfif Len(s_id)>
							<cfset s_tmp_value = "#qRec[s_db_column][1]#">
						</cfif>
						<cfoutput><input type="text" name="fl_#s_db_column#" value="#s_tmp_value#" style="width:99%"></cfoutput>
                    <!--- RADIO --->
                    <cfelseif s_type IS "radio">
                    	<cfset b_checked_1 = "">
                    	<cfset b_checked_2 = "">
                    	<cfif isDefined("qRec") AND qRec[s_db_column][1] IS 1>
                        	<cfset b_checked_1 = "checked">
                        <cfelse>
                            <cfset b_checked_2 = "checked">
                        </cfif>
                    	<cfoutput>
                          <input type="radio" name="fl_#s_db_column#" value="1" #b_checked_1# /> Yes &nbsp;&nbsp;&nbsp;
                          <input type="radio" name="fl_#s_db_column#" value="0" #b_checked_2# /> No 
                        </cfoutput>
					<!--- SELECTBOX --->
					<cfelseif (s_type IS "show" AND NOT Len(s_id)) OR s_type IS "select">
						<cfoutput><select name="fl_#s_db_column#"></cfoutput>
							<cfset j = 1>
							<cfloop list="#l_sel_values#" index="s_value">
								<cfset s_tmp_selected = "">
								<cfif Len(s_id) AND s_value IS qRec[s_db_column][1]>
									<cfset s_tmp_selected = " selected">
								</cfif>
								<cfoutput><option value="#s_value#"#s_tmp_selected#>#ListGetAt(l_sel_names, j)#</option></cfoutput>
								<cfset j = j + 1>
							</cfloop>
						<cfoutput></select></cfoutput>
					<!--- JUST SHOW --->
					<cfelseif s_type IS "show">
						<cfoutput><input type="hidden" name="fl_#s_db_column#" value="#qRec[s_db_column][1]#"></cfoutput>
						<cfoutput>#qRec[s_db_column][1]#</cfoutput>
					</cfif>
				<cfoutput></td></cfoutput>
			<cfoutput></tr></cfoutput>
			<cfset i = i + 1>
		</cfloop>
		
		<!--- tooltip --->
		<cfif b_tooltip>
			<cfloop list="#l_tooltip_fields#" index="s_tool">
				<cfset s_tool_title = ListLast(s_tool, "|")>
				<cfset s_tool_column = ListFirst(s_tool, "|")>
				<cfset s_tool_description = "">
				<cfif isDefined("st_tool")>
					<cfset s_tool_description = st_tool[s_tool_column]>
				</cfif>
				<cfoutput>
					<tr>
						<td>#s_tool_title#</td>
						<td><textarea name="#s_tool_column#">#s_tool_description#</textarea></td>
					</tr>
				</cfoutput>
			</cfloop>
		</cfif>
	</cfcase>
	
	<!--- UPDATE --->
	<cfcase value="update">
		<cfset i = 1>
		<cfquery datasource="#application.g.ds#" name="qUpdate">
			UPDATE #s_table#
				SET
				<cfloop list="#l_db_columns#" index="s_key">
					<cfset s_field = "fl_" & s_key>
					#s_key# = '#form[s_field]#'<cfif i LT ListLen(l_db_columns)>,</cfif>
					<cfset i = i + 1>
				</cfloop>
			WHERE #s_id_column# = '#s_id#'
		</cfquery>
		
		<!--- tooltip --->
		<cfif b_tooltip>
			<cfloop list="#l_tooltip_fields#" index="s_tool">
				<cfset s_tool_column = ListFirst(s_tool, "|")>
				<cfset s_tool_form = form[s_tool_column]>
				<cfquery datasource="#application.g.ds#" name="qUTT">
					UPDATE TT
						SET TT_DESCRIPTION = '#s_tool_form#'
						WHERE TT_SECTION = '#s_tooltip#'
							AND TT_FIELD = '#s_tool_column#'
							AND TT_SECTION_ID = '#s_id#'
				</cfquery>
			</cfloop>
		</cfif>
		
		<cflocation url="#application.g.s_path_base#/index.cfm/#request.s_page#">
	</cfcase>
	
	<!--- CREATE --->
	<cfcase value="create">
		<cfset l_insert = "">
		<cfset i = 1>
		<cfloop list="#l_db_columns#" index="s_key">
			<cfset s_field = "fl_" & s_key>
			<cfset s_field = '#form[s_field]#'>
			<cfset l_insert = ListAppend(l_insert, s_field, "|")>
			<cfset i = i + 1>
		</cfloop>
		
		<cfif Len(s_sequence)>
			<cfquery datasource="#application.g.ds#" name="qSel">
				SELECT MAX(#s_sequence#) AS max_seq FROM #s_table#
			</cfquery>
			
			<cfset i_sequence_num = lSParseNumber(qSel.max_seq[1]) + 1>
			<cfset s_sequence_col = ",#s_sequence#">
			<cfset s_sequence_val = ",#i_sequence_num#">
		<cfelse>
			<cfset s_sequence_col = "">
			<cfset s_sequence_val = "">
		</cfif>
		
		<cfquery datasource="#application.g.ds#" name="qCreate">
			SET NOCOUNT ON
			
			INSERT INTO #s_table# (#l_db_columns##s_sequence_col#) VALUES (<cfqueryparam value="#l_insert#" list="yes" separator="|">#s_sequence_val#)
			
			SELECT @@identity AS s_latest_id
			
			SET NOCOUNT OFF
		</cfquery>
		
		
		
		<!--- tooltip --->
		<cfif b_tooltip>
			<cfloop list="#l_tooltip_fields#" index="s_tool">
				<cfset s_tool_column = ListFirst(s_tool, "|")>
				<cfset s_tool_form = form[s_tool_column]>
				<cfquery datasource="#application.g.ds#" name="qUTT">
					INSERT INTO TT
						(TT_SECTION, TT_FIELD, TT_SECTION_ID, TT_DESCRIPTION)
					VALUES
						('#s_tooltip#', '#s_tool_column#', '#qCreate.s_latest_id#', '#s_tool_form#')
				</cfquery>
			</cfloop>
		</cfif>
		
		<cflocation url="#application.g.s_path_base#/index.cfm/#request.s_page#">
	</cfcase>
</cfswitch>

<cfoutput></table></form></div></cfoutput>

<!--- BUTTONS --->
<cfif isDefined("l_button_names") AND ListLen(l_button_names)>
	<cfoutput>
		<br>
		<ul class="dfooter">
	</cfoutput>
	<cfset i = 1>
	<cfloop list="#l_button_names#" index="s_key">
		<cfoutput>
			<li<cfif i IS 1> class="first"</cfif>>
				<a href="#ListGetAt(l_button_links, i)#">#s_key#</a>
			</li>
		</cfoutput>
		<cfset i = i + 1>
	</cfloop>

	<cfoutput>
			<br class="brclear"></br>
		</ul>
	</cfoutput>
</cfif>


<cfsetting enablecfoutputonly="No">