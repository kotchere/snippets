<cfsetting enablecfoutputonly="Yes">
<!----------------------------------------------------------------
Template: reports.cfm

Date created: 08/10/2011

Author: Kwaku Otchere kotchere@webworldtech.com

Type: Template

Description: 

Related files:
----------------------------------------------------------------->
<cfset s_page_title = "Reports">
<cfset b_noentries = false>
<cfset l_crumb = "reports|Reports">
<cfparam name="b_report" default="true">
<cfparam name="l_groups" default="x">
<cfset s_help = "data_entry">

<cfset s_orderby = "ORDER BY (CASE WHEN )">

<!--- LANDING PAGE --->
<cfif lCase(request.s_action) IS "">
	<cfoutput>
		<table border=0 class="norm">
			<col width="50%"/>
			<col width="50%"/>
			<tr>
				<td><button onclick="nn.goto('reports/individual')">Individual Reports</button></td>
				<td><button onclick="nn.goto('reports/benchmark')">Benchmark Reports</button></td>
			</tr>
			<tr>
				<td>To review and print your individual performance data based on submitted data<br><br></td>
				<td>To obtain benchmark reports and customize search criteria<br><br></td>
			</tr>
			<tr>
				<td><button onclick="nn.goto('reports/group')">Group Reports</button></td>
				<td>
					<cfif session.st_user.b_faculty OR session.st_user.b_admin>
						<button onclick="nn.goto('reports/faculty')">Faculty Reports</button>
					</cfif>
				</td>
			</tr>
			<tr>
				<td>To review and print group reports of HIV providers associated in a specific group<br><br></td>
				<td>
					<cfif session.st_user.b_faculty OR session.st_user.b_admin>
						To review and print any user's report
					</cfif>
				</td>
			</tr>
		</table>
	</cfoutput>
	
<!--- REPORTS --->
<cfelse>
	
	<!--- get users with data disabled --->
	<cfquery datasource="#application.g.ds#" name="q_dis">
		SELECT * FROM USR WHERE USR_BDATA_DISABLED = 1
	</cfquery>
	
	<!--- get periods in correct order --->
	<cfquery datasource="#application.g.ds#" name="q_p">
		SELECT PERIOD_ID FROM PERIOD ORDER BY PERIOD_SEQ_NUM
	</cfquery>
	<cfset l_periods = ValueList(q_p.PERIOD_ID)>
		
	<cfparam name="form.check_period" default="">
	<!--- add user header --->
	<cfinvoke component="#application.g.s_path_components#.users" method="header_info">
		
	<!--- include xml header --->
	<cfinclude template="../includes/xml_header.cfm">
	<cfset b_start_xml = true>

	<!--- get periods --->
	<cfinvoke component="#application.g.s_path_components#.navigation" method="get_periods" returnvariable="a_periods">
	
		<cfparam name="form.sel_states" default="">
		<cfparam name="form.sel_facilities" default="">
		<cfparam name="form.sel_parts" default="">
			
	<!--- report filter --->
	<cfoutput>
		<div class="frm">
			<form name="frm_report" id="frm_report" action="#application.g.s_path_base#/index.cfm/#request.s_page#/#request.s_action#" method="post">
			<table>
				<col width="20"/>
				<col width="245"/>
				<col width="20"/>
				<col width="245"/>
				<col width="20"/>
				<col width="245"/>
				
				<!--- group select --->
				<cfif lCase(request.s_action) IS "group">
					<cfoutput>
						<h4>Select group(s):</h4><br>
						<select multiple name="l_groups" class="mult" style="width:70%;margin-bottom:10px">
							<cfloop collection="#session.st_user.st_groups#" item="s_group_id">
								<cfset s_group_selected = "">
								<cfif StructKeyExists(form, "l_groups") AND ListFindNoCase(form.l_groups, s_group_id)>
									<cfset s_group_selected = " selected">
								</cfif>
								<option value="#s_group_id#"#s_group_selected#>#session.st_user.st_groups[s_group_id]#</option>
							</cfloop>
						</select>
					</cfoutput>
				</cfif>
	</cfoutput>
	
	<!--- if faculty --->
	<cfif (session.st_user.b_faculty OR session.st_user.b_admin) AND lCase(request.s_action) IS "faculty">
		<!--- <cfparam name="form.s_grantee_id" default=""/> --->
		<cfparam name="form.s_users_id" default=""/>
		
		<!--- <!--- get users --->
				<cfquery datasource="#application.g.ds#" name="q_users">
					SELECT USR_ID, GRANTEE_NAME, GRANTEE_ID, USR_ORGANIZATION
					FROM USR, GRANTEE
						WHERE USR_GRANTEE = GRANTEE_ID
						ORDER BY GRANTEE_NAME
				</cfquery> --->
		
		
		<!--- if user is faculty, then only show them the organizations they are allowed to view --->
		<cfset l_faculty_orgs = "">
		<cfif session.st_user.b_faculty>
			<!--- ensure faculty list is bogus at first --->
			<cfset l_faculty_orgs = "-">
			<cfquery datasource="#application.g.ds#" name="qfaculty">
				SELECT FACULTY_ORG_ORG_ID FROM FACULTY_ORG WHERE FACULTY_ORG_USR_ID = '#session.st_user.id#'
			</cfquery>
			<cfif qfaculty.recordCount GTE 1>
				<!--- repopulate faculty list with correct organization --->
				<cfset l_faculty_orgs = qFaculty["FACULTY_ORG_ORG_ID"][1]>
			</cfif>
		</cfif>
		
		<!--- get users --->
		<cfquery datasource="#application.g.ds#" name="q_users">
			SELECT USR_ID, USR_ORGANIZATION
				FROM USR
				WHERE 1 = 1
				
				<cfif ListLen(l_faculty_orgs)>
					AND USR_ID IN (<cfqueryparam value="#l_faculty_orgs#" cfsqltype="cf_sql_varchar" list="true" separator="|"></cfqueryparam>)
				</cfif>
				
				<cfif q_dis.recordCount>
					AND USR_ID NOT IN (<cfqueryparam value="#ValueList(q_dis.USR_ID)#" cfsqltype="cf_sql_varchar" list="true" />)
				</cfif>
				ORDER BY USR_ORGANIZATION
		</cfquery>
		
		<!--- <cfset st_grant = StructNew()>
				<cfset a_u_grantees = ArrayNew(1)>
				<cfloop query="q_users">
					<cfif NOT StructKeyExists(st_grant, q_users.GRANTEE_ID)>
						<cfset st_tmp = StructNew()>
						<cfset st_tmp.value = q_users.GRANTEE_ID>
						<cfset st_tmp.text  = q_users.GRANTEE_NAME>
						<cfset tmp = ArrayAppend(a_u_grantees, st_tmp)>
						<cfset st_grant[q_users.GRANTEE_ID] = "">
					</cfif>
					<cfset st_grant[q_users.GRANTEE_ID] = ListAppend(st_grant[q_users.GRANTEE_ID], q_users.USR_ID)>
				</cfloop> --->
		
		<cfset tmp_org = "">
		<cfset a_users = ArrayNew(1)>
		<cfset i = 1>
		<cfloop query="q_users">
			<cfset a_users[i] = StructNew()>
			<cfset a_users[i].value = q_users.USR_ID>
			<cfset a_users[i].text = q_users.USR_ORGANIZATION> <!--- q_users.USR_FIRSTNAME & " " & q_users.USR_LASTNAME & " (" & q_users.USR_USERNAME & ")"> --->
			<cfif a_users[i].value IS form.s_users_id>
				<cfset tmp_org = a_users[i].text>
			</cfif>
			<cfset i = i + 1>
		</cfloop>
		
		<cfset st_tmp = StructNew()>
		<cfset st_tmp.value = "">
		<cfset st_tmp.text = "-----------------------------------------">
		<cfset tmp = ArrayPrepend(a_users, st_tmp)>
		
		<!--- faculty dropdown --->
		<cfoutput>Organization:<br></cfoutput>
		<!--- <cfinvoke component="#application.g.s_path_components#.ui" method="set_field" 
					s_name="s_grantee_id" o_extra="#a_u_grantees#" s_type="select" s_value="#form.s_grantee_id#" b_text="false" i_width="400"> --->
		<cfinvoke component="#application.g.s_path_components#.ui" method="set_field" 
			s_name="s_users_id" o_extra="#a_users#" s_type="select" s_value="#form.s_users_id#" b_text="false" i_width="400">
			<cfoutput><br><br></cfoutput>
		
		<cfset s_print_filter = '<strong>Organization:</strong> #tmp_org#<br>'>
	</cfif>
	
	<!--- include period filter --->
	<cfinclude template="../includes/filter_periods.cfm">

	<!--- generate report button --->
	<cfoutput>
				<tr>
					<td colspan="6" class="end">
						<ul class="dfooter">
							<li class="first"><a href="javascript:nn.form.submit_form('##frm_report')">Generate Report</a></li>
							<br class="brclear"/>
						</ul>
				</tr>
			</table>
			</form>
		</div>
	</cfoutput>
	
	<cfoutput><div class="prnt">#s_print_filter#</div></cfoutput>
	
	<!--- BENCHMARK report --->
	<cfif lCase(request.s_action) IS "benchmark">
		<!--- title, crumb --->
		<cfset s_page_title = "Benchmark Report">
		<cfset l_crumb = l_crumb & ",-|Benchmark Report">
		<cfset s_help = "reports_benchmark">
		
		<cfif StructKeyExists(form, "check_period") AND Len(form.check_period)>	
			<!--- get ALL entries --->
			<cfquery datasource="#application.g.ds#" name="qEntries">
				SELECT 
					--(100 * ENTRY_INDICATOR_NUM/ENTRY_INDICATOR_DENOM) AS PERCENT_TOTAL,
					ENTRY_ID, 
					ENTRY_INDICATOR_ID,
					ENTRY_PERIOD_ID,
					ENTRY_USR_ID,
					INDCATR_ID,
					INDCATR_TYPE,
					INDCATR_TITLE,
                    INDCATR_REVERSE,
					PERIOD_ID,
					PERIOD_TITLE,
					USR_ORGANIZATION,
					USR_PART,
					--GRANTEE_PROJECT,
					USR_STATE,
					ENTRY_INDICATOR_NUM AS NUMERATOR, 
					ENTRY_INDICATOR_DENOM AS DENOMINATOR 	
				FROM ENTRY
					INNER JOIN PERIOD
						ON ENTRY_PERIOD_ID = PERIOD_ID
						<cfif Len(Trim(form.check_period))>AND ENTRY_PERIOD_ID IN (#PreserveSingleQuotes(form.check_period)#)</cfif>
					INNER JOIN INDCATR
						ON ENTRY_INDICATOR_ID = INDCATR_ID
					INNER JOIN USR
						ON ENTRY_USR_ID = USR_ID
					--INNER JOIN GRANTEE
						--ON USR_GRANTEE = GRANTEE_ID
				
				<cfif q_dis.recordCount>
					WHERE ENTRY_USR_ID NOT IN (<cfqueryparam value="#ValueList(q_dis.USR_ID)#" cfsqltype="cf_sql_varchar" list="true" />)
				</cfif>
				
			</cfquery>
			
			<!--- reduce duplicates in list (so max parameter in sql is never reached) --->
			<cfset st_tmp_entryid = StructNew()>
			<cfloop index="i_u" list="#ValueList(qEntries.ENTRY_USR_ID)#">
				<cfset st_tmp_entry_id[i_u] = "">
			</cfloop>
			<cfset l_entry_usr_id = StructKeyList(st_tmp_entry_id)>
			
			<!--- get ALL facilities of users who entered --->
			<cfset b_facilities = false>
			<cfset st_facilities2usr = StructNew()>
			<cfif qEntries.recordCount>
				<cfquery datasource="#application.g.ds#" name="q_usr_facilities">
					SELECT * 
					FROM USR_FACILITY 
						WHERE USR_FACILITY_USR_ID IN (<cfqueryparam value="#l_entry_usr_id#" cfsqltype="cf_sql_varchar" list="true" />)
				</cfquery>
				<cfif q_usr_facilities.recordCount>
					<cfset b_facilities = true>
					<cfloop query="q_usr_facilities">
						<cfif NOT StructKeyExists(st_facilities2usr, USR_FACILITY_FACILITY_ID)>
							<cfset st_facilities2usr[USR_FACILITY_FACILITY_ID] = USR_FACILITY_USR_ID>
						<cfelse>
							<cfset st_facilities2usr[USR_FACILITY_FACILITY_ID] = ListAppend(st_facilities2usr[USR_FACILITY_FACILITY_ID], USR_FACILITY_USR_ID)>
						</cfif>
					</cfloop>
				</cfif>
			</cfif>
			
			<!--- assign to structure measure/indicator --->
			<cfset st_my_indicator = StructNew()>
			<cfset l_indicator_ids = "">
			<cfset st_ind = StructNew()>
			<cfset l_new_columns = ListAppend(qEntries.columnList, "PERCENT_TOTAL")>
			<cfloop from="1" to="#qEntries.recordCount#" index="i">
				<cfset i_indicator_id = qEntries["INDCATR_ID"][i]>
				<cfset i_period_id = qEntries["PERIOD_ID"][i]>
				<cfif NOT StructKeyExists(st_my_indicator, i_indicator_id)>
					<cfset st_my_indicator[i_indicator_id] = StructNew()>
					<cfset st_ind[i_indicator_id] = StructNew()>
					<cfset st_ind[i_indicator_id]["title"] = qEntries["INDCATR_TITLE"][i]>
					<cfset st_ind[i_indicator_id]["type"] = qEntries["INDCATR_TYPE"][i]>
					<cfset l_indicator_ids = ListAppend(l_indicator_ids, i_indicator_id)>
				</cfif>
				<cfif NOT StructKeyExists(st_my_indicator[i_indicator_id], i_period_id)>
					<cfset st_my_indicator[i_indicator_id][i_period_id] = StructNew()>
					<cfset st_my_indicator[i_indicator_id][i_period_id]["all"] = QueryNew(l_new_columns)>
				</cfif>
				<cfset temp = QueryAddRow(st_my_indicator[i_indicator_id][i_period_id]["all"])>
				<cfloop list="#l_new_columns#" index="s_row">
					<cfif s_row IS "PERCENT_TOTAL">
						<!--- if indicator type 2, then copy numerator to percent_total --->
						<cfif qEntries["INDCATR_TYPE"][i] IS 2>
							<cfset temp = QuerySetCell(st_my_indicator[i_indicator_id][i_period_id]["all"], s_row, qEntries["NUMERATOR"][i])>
						<!--- if indicator type 1, get percentage --->
						<cfelse>
							<cfif qEntries["DENOMINATOR"][i] IS NOT 0>
								<cfset tmp_percent = (100 * (qEntries["NUMERATOR"][i]/qEntries["DENOMINATOR"][i]))>
							<cfelse>
								<cfset tmp_percent = 0>
							</cfif>
							<cfset temp = QuerySetCell(st_my_indicator[i_indicator_id][i_period_id]["all"], s_row, tmp_percent)>
						</cfif>
					<!--- all others--->
					<cfelse>
						<cfset temp = QuerySetCell(st_my_indicator[i_indicator_id][i_period_id]["all"], s_row, qEntries[s_row][i])>
					</cfif>
				</cfloop>
			</cfloop>
			
			<!--- assign rest such as mine,filter, etc --->
			<cfset l_modes = "all,mine,filter,all10,all25">
			<cfset l_names = "National Score,My Score,Selection Criteria,Top 10% Nationally,Top 25% Nationally">
			<cfset i_z = 1>

			<!--- sort list --->
			<cfset l_indicator_ids = ListSort(l_indicator_ids, "numeric")>
			
			<!--- if parts is defined... --->
			<cfif Len(form.sel_parts)>
				<cfquery datasource="#application.g.ds#" name="qParts_ids">
					SELECT ENTRY_ID FROM ENTRY
					 	INNER JOIN USR 
							ON ENTRY_USR_ID = USR_ID
						INNER JOIN GRANTEE 
							ON USR_GRANTEE = GRANTEE_ID
					WHERE GRANTEE_PROJECT = '#form.sel_parts#'
				</cfquery>		
			</cfif>
			
			<!--- loop through indicators --->
			<!--- <cfloop collection="#st_my_indicator#" item="s_key"> --->
			<cfloop list="#l_indicator_ids#" index="s_key">
				<cfloop collection="#st_my_indicator[s_key]#" item="s_period">
					<cfset q_all = st_my_indicator[s_key][s_period]["all"]>
					<cfloop list="#l_modes#" index="s_mode">
						<cfswitch expression="#s_mode#">
							<!--- DEFAULT: ALL --->
							<cfcase value="all">
								<cfset q = q_all>
							</cfcase>
							<!--- MINE --->
							<cfcase value="mine">
								<cfquery dbtype="query" name="q">
									SELECT * FROM q_all WHERE ENTRY_USR_ID = '#TRIM(session.st_user.id)#'
								</cfquery>
							</cfcase>
							<!--- FILTER --->
							<cfcase value="filter">
								<cfset s_sql = "">
								<!--- find state --->
								<cfif Len(form.sel_states)>
									<cfset s_sql = s_sql & " AND USR_STATE = '#form.sel_states#'">
								</cfif>
								<!--- find facility --->
								<cfif Len(form.sel_facilities) AND StructKeyExists(st_facilities2usr, form.sel_facilities)>
								<!--- ;JOE 2/14 had to change the operator to "IN" and loop thru the facilites to add single quotes around each entry --->
									<cfset theListOfFacilites = "">
									<cfloop list="#st_facilities2usr[form.sel_facilities]#" index="ivi">
										<cfset addSome = "'" & ivi & "'">
										<cfset theListOfFacilites = ListAppend(theListOfFacilites,addSome)>
									</cfloop>
									<cfset s_sql = s_sql & " AND ENTRY_USR_ID IN (#theListOfFacilites#)">
								
									<!--- <cfset s_sql = s_sql & " AND ENTRY_USR_ID = '#st_facilities2usr[form.sel_facilities]#'"> --->
								</cfif>
								<!--- find part --->
								<cfif Len(form.sel_parts)>
									<cfif qParts_ids.recordCount>
										<cfset s_sql = s_sql & " AND ENTRY_ID IN (#ValueList(qEntries.ENTRY_ID)#)">
									</cfif>
									<!--- <cfset s_sql = s_sql & " AND GRANTEE_PROJECT = '#form.sel_parts#'"> --->
								</cfif>
								<cfif NOT Len(s_sql)>
									<cfset s_sql = "WHERE 1=0">
								<cfelse>
									<cfset s_sql = "WHERE 1=1 " & s_sql>
								</cfif>
								
								<cfquery dbtype="query" name="q">
									SELECT * FROM q_all #PreserveSingleQuotes(s_sql)#
								</cfquery>
							</cfcase>
							<!--- 10% --->
							<cfcase value="all10">
								<cfset i_max = Ceiling(.10 * st_my_indicator[s_key][s_period]["all"].recordCount)>
                                <cfset s_order = "DESC">
                                <cfif st_my_indicator[s_key][s_period]["all"].INDCATR_REVERSE IS 1>
                                	<cfset s_order = "ASC">
                                </cfif>
								<cfquery dbtype="query" name="q" maxrows="#i_max#">
									SELECT * FROM q_all ORDER BY PERCENT_TOTAL #s_order#
								</cfquery>
							</cfcase>
							<!--- 25% --->
							<cfcase value="all25">
								<cfset i_max = Ceiling(.25 * st_my_indicator[s_key][s_period]["all"].recordCount)>
                                <cfset s_order = "DESC">
                                <cfif st_my_indicator[s_key][s_period]["all"].INDCATR_REVERSE IS 1>
                                	<cfset s_order = "ASC">
                                </cfif>
								<cfquery dbtype="query" name="q" maxrows="#i_max#">
									SELECT * FROM q_all ORDER BY PERCENT_TOTAL #s_order#
								</cfquery>
							</cfcase>
						</cfswitch>
						<cfif q.recordCount>
							<cfset st_my_indicator[s_key][s_period]["_#s_mode#_patients"] = ArraySum(ListToArray(ValueList(q.DENOMINATOR)))>
							<!--- <cfset st_my_indicator[s_key][s_period]["_#s_mode#_mean"] = ArraySum(ListToArray(ValueList(q.PERCENT_TOTAL)))/q.recordCount> --->
							<cfset st_my_indicator[s_key][s_period]["_#s_mode#_mean"] = 100 * (ArraySum(ListToArray(ValueList(q.NUMERATOR)))/ArraySum(ListToArray(ValueList(q.DENOMINATOR))))>
							<cfset st_my_indicator[s_key][s_period]["_#s_mode#_org"] = q.recordCount>
						</cfif>
						<cfset st_my_indicator[s_key][s_period][s_mode] = q>	
					</cfloop>
				</cfloop>
				
				<!--- CHART --->
				<cfoutput><div class="chart"></cfoutput>
				<cfoutput><h4>#st_ind[s_key]["title"]#</h4></cfoutput>
			
				<cfif st_ind[s_key]["type"] IS 1>
					<cfset s_chart = "../css/xml/percent.xml">
				<cfelse>
					<cfset s_chart = "../css/xml/normal.xml">
				</cfif>
				
				<cfset z = 1>
				<cfchart style="#s_chart#" chartWidth="630" chartHeight="500" format="png">
					<cfloop list="#l_modes#" index="s_mode">
						<cfchartseries serieslabel="#ListGetAt(l_names,z)#" type="line">
							<!--- <cfloop collection="#st_my_indicator[s_key]#" item="s_period">--->
							<cfloop list="#l_periods#" index="s_period">
								<cfif StructKeyExists(st_my_indicator[s_key], s_period)>
									<cfset s_item_title = st_my_indicator[s_key][s_period]["all"]["PERIOD_TITLE"]>
									<cfif isDate(s_item_title)>
										<cfset s_item_title = DateFormat(s_item_title, 'mmmm yyyy')>
									</cfif>
									<cfset s_data = "_" & s_mode & "_mean">
									<cfif StructKeyExists(st_my_indicator[s_key][s_period], s_data)>
										<cfchartdata item="#s_item_title#" value="#st_my_indicator[s_key][s_period][s_data]#">
									</cfif>
								</cfif>
							</cfloop>
						</cfchartseries>
						<cfset z = z + 1>
					</cfloop>
				</cfchart>
				
				<cfoutput></div></cfoutput>
				
				<cfinclude template="../includes/table_benchmark.cfm">
				<cfset i_z = i_z + 1>	
			</cfloop>
			

		
			<cfset s_xml = s_xml & '</Workbook>'>
			<cfoutput>
				<form name="x_form" action="../../excel/excel_results.cfm" method="post" target="_blank">
					<input type="hidden" name="xdata" value="#URLEncodedFormat(s_xml)#">
					<input type="hidden" name="page" value="benchmark_report">
				</form>
			</cfoutput>
		
			<!--- links on sidebar --->
			<cfset request.a_links = ArrayNew(1)>
			<cfset request.a_links[1] = StructNew()>
			<cfset request.a_links[1].text = "Export to Excel">
			<cfset request.a_links[1].link = "javascript:document.x_form.submit()">
			<cfset request.a_links[2] = StructNew()>
			<cfset request.a_links[2].text = "Print Report">
			<cfset request.a_links[2].link = "javascript:window.print()">
		</cfif>
	</cfif>
		
	
	<!--- if INDIVIDUAL OR FACULTY OR GROUP --->
	<cfif ListFindNoCase("individual,group,faculty", lCase(request.s_action))>
		
		<!--- INDIVIDUAL REPORT --->
		<cfif lCase(request.s_action) IS "individual">
			<cfset s_user_id = session.st_user.id>
			<cfset s_page_title = "Individual Report">
			<cfset l_crumb = l_crumb & ",-|Individual Report">
			<cfset s_help = "reports_individual">
			
			<cfquery datasource="#application.g.ds#" name="qEntries">
				SELECT ENTRY_ID, 
					ENTRY_INDICATOR_DENOM AS DENOMINATOR, 
					ENTRY_INDICATOR_NUM AS NUMERATOR, 
					ENTRY_PERIOD_ID, ENTRY_INDICATOR_ID, INDCATR_TITLE,INDCATR_TYPE,PERIOD_ID,PERIOD_TITLE
						FROM ENTRY, INDCATR, PERIOD
							WHERE ENTRY_USR_ID = '#s_user_id#' 
								AND ENTRY_INDICATOR_ID = INDCATR_ID
								AND ENTRY_PERIOD_ID = PERIOD_ID
								<cfif Len(Trim(form.check_period))>AND ENTRY_PERIOD_ID IN (#PreserveSingleQuotes(form.check_period)#)</cfif>
						ORDER BY PERIOD_SEQ_NUM
			</cfquery>
		
		<!--- FACULTY REPORT --->
		<cfelseif (session.st_user.b_faculty OR session.st_user.b_admin) AND lCase(request.s_action IS "faculty")>
			<!--- title, crumb --->
			<cfset s_page_title = "Faculty Report">
			<cfset l_crumb = l_crumb & ",-|Faculty Report">
			<cfif Len(form.s_users_id)>
				<!--- <cfset s_user_id = form.s_user_id> --->
				<cfset s_page_title = "Faculty Report">
				<cfset l_crumb = l_crumb & ",-|Faculty Report">
				<!--- <cfset l_user_ids = st_grant[form.s_grantee_id]> --->
					
				<cfquery datasource="#application.g.ds#" name="qEntries">
					SELECT ENTRY_ID, 
						ENTRY_INDICATOR_DENOM AS DENOMINATOR, 
						ENTRY_INDICATOR_NUM AS NUMERATOR, 
						ENTRY_PERIOD_ID, ENTRY_INDICATOR_ID, INDCATR_TITLE,INDCATR_TYPE,PERIOD_ID,PERIOD_TITLE
							FROM ENTRY, INDCATR, PERIOD
							WHERE ENTRY_USR_ID IN (<cfqueryparam value="#form.s_users_id#" cfsqltype="cf_sql_varchar" list="true" />)
									AND ENTRY_INDICATOR_ID = INDCATR_ID
									AND ENTRY_PERIOD_ID = PERIOD_ID
									<cfif Len(Trim(form.check_period))>AND ENTRY_PERIOD_ID IN (#PreserveSingleQuotes(form.check_period)#)</cfif>
							ORDER BY PERIOD_SEQ_NUM
				</cfquery>
			<cfelse>
				<cfset b_report = false>
			</cfif>
		
		<!--- GROUP REPORT --->
		<cfelseif lCase(request.s_action) IS "group">
			<!--- title, crumb --->
			<cfset s_page_title = "Group Report">
			<cfset l_crumb = l_crumb & ",-|Group Report">
			<cfif StructKeyExists(form, "l_groups")>
				<cfset l_groups = form.l_groups>
			<cfelse>
				<cfset l_groups = session.st_user.l_groups>
			</cfif>
			<cfset s_help = "reports_group">
			
		</cfif>
		<cfset o = 1>
		<cfloop list="#l_groups#" index="s_group">
			<cfif lCase(request.s_action) IS "group" AND StructKeyExists(form, "check_period") AND Len(form.check_period)>
				<!--- get entries --->
				<cfquery datasource="#application.g.ds#" name="qEntries">
				SELECT INDCATR_TITLE, INDCATR_TYPE, PERIOD_ID, PERIOD_TITLE, ENTRY_INDICATOR_ID, NUMERATOR, DENOMINATOR, NUM_PROVIDER
						FROM INDCATR I
							INNER JOIN
							(
								SELECT ENTRY_PERIOD_ID, ENTRY_INDICATOR_ID,
									SUM(ENTRY_INDICATOR_NUM) AS NUMERATOR, 
									SUM(ENTRY_INDICATOR_DENOM) AS DENOMINATOR,
									COUNT(ENTRY_USR_ID) AS NUM_PROVIDER
									FROM ENTRY,INDCATR
									WHERE ENTRY_USR_ID IN 
									(
										SELECT DISTINCT(USR_ID)
											FROM USR
												INNER JOIN USR_GROUPS
													ON USR_GROUPS_GROUPS_ID IN (#s_group#)
														AND USR_ID = USR_GROUPS_USR_ID
									)
									<cfif q_dis.recordCount>
										AND ENTRY_USR_ID NOT IN (<cfqueryparam value="#ValueList(q_dis.USR_ID)#" cfsqltype="cf_sql_varchar" list="true" />)
									</cfif>
									AND INDCATR_ID = ENTRY_INDICATOR_ID				
									GROUP BY ENTRY_PERIOD_ID, ENTRY_INDICATOR_ID
							) E
							ON 
								I.INDCATR_ID = E.ENTRY_INDICATOR_ID
							<cfif Len(Trim(form.check_period))>AND ENTRY_PERIOD_ID IN (#PreserveSingleQuotes(form.check_period)#)</cfif>
							INNER JOIN PERIOD
								ON PERIOD_ID = ENTRY_PERIOD_ID
						ORDER BY PERIOD_SEQ_NUM
					</cfquery>
				
				<cfoutput><h4><br>Group: #session.st_user.st_groups[s_group]#</h4><br></cfoutput>
			</cfif>
			
			
			<!--- no records --->
			<cfif isDefined("qEntries") AND qEntries.recordCount IS 0 AND StructKeyExists(form, "check_period") AND Len(form.check_period)>
				<cfset b_noentries = true>
				<cfoutput><h4 class="error"><br>NO Entry records returned</h4></cfoutput>
			</cfif>
		
			<!--- only search when search criteria is defined --->
			<cfif StructKeyExists(form, "check_period") AND Len(form.check_period) AND b_report>
				<cfset a_indicators = ArrayNew(1)>
				<cfset st_indicators2index = StructNew()>

				<!--- create array of queries with all indicators - grouped by indicator_ID --->
				<cfset i = 1>
				<cfset l_columnList = qEntries.columnList>
				<cfset l_columnList = ListAppend(l_columnList, 'ENTRY_TOTAL')>
				<cfloop from="1" to="#qEntries.recordCount#" index="i_index">
					<cfif NOT StructKeyExists(st_indicators2index, qEntries.ENTRY_INDICATOR_ID[i_index])>
						<!--- store in variables array to be used later as the chart query string --->
						<cfset Variables["q_indicators_#i#"] = QueryNew(l_columnList)>
						<!--- store query in array --->
						<cfset a_indicators[i] = Variables["q_indicators_#i#"]>
						<!--- store indicator id to query index --->
						<cfset st_indicators2index[qEntries.ENTRY_INDICATOR_ID[i_index]] = i>
						<cfset i = i + 1>
					</cfif>
					<!--- create query row --->
					<cfset temp  = QueryAddRow(a_indicators[st_indicators2index[qEntries.ENTRY_INDICATOR_ID[i_index]]], 1)>
					<!--- loop and set cells for current row --->
					<cfloop list="#l_columnList#" index="s_column">
						<cfif ListFindNoCase(qEntries.columnList, s_column)>
							<cfset temp = QuerySetCell(a_indicators[st_indicators2index[qEntries.ENTRY_INDICATOR_ID[i_index]]], s_column, qEntries[s_column][i_index])>
						</cfif>
					</cfloop>
					<!--- find total percentage or just use numerator in the case of indicator type 1 --->
					<cfif qEntries.INDCATR_TYPE[i_index] IS 1>
						<cfif qEntries.DENOMINATOR[i_index] IS 0>
							<cfset i_total = 0>
						<cfelse>
							<cfset i_total = NumberFormat((qEntries.NUMERATOR[i_index] / qEntries.DENOMINATOR[i_index]) * 100, ".99")>
						</cfif>
					<cfelse>
						<cfset i_total = qEntries.NUMERATOR[i_index]>
					</cfif>
					<cfset temp = QuerySetCell(a_indicators[st_indicators2index[qEntries.ENTRY_INDICATOR_ID[i_index]]], 'ENTRY_TOTAL', i_total)>
				</cfloop>
				<cfset i_row_worksheet = (ArrayLen(a_indicators) * ArrayLen(a_periods)) + (ArrayLen(a_indicators) * 2)>
				<cfif lCase(request.s_action) IS "group">
					<cfset s_group_heading = Left(session.st_user.st_groups[s_group],10)>
					<cfset i_row_worksheet = i_row_worksheet + 1>
				<cfelse>
					<cfset s_group_heading = "Sheet 1">
				</cfif>
				<cfset s_xml = s_xml & '<Worksheet ss:Name="#s_group_heading#">
					<Table ss:ExpandedColumnCount="4" ss:ExpandedRowCount="#i_row_worksheet#" x:FullColumns="1" x:FullRows="1">
						<Column ss:Index="1" ss:Width="120" />
						<Column ss:Index="2" ss:Width="120" />
						<Column ss:Index="3" ss:Width="120" />
						<Column ss:Index="4" ss:Width="120" />
				'>
				<cfif lCase(request.s_action) IS "group">
					<cfset s_xml = s_xml & '
						<Row ss:Height="25.0">
							<Cell colspan="4" ss:StyleID="groupHeading">
								<Data ss:Type="String">GROUP: #session.st_user.st_groups[s_group]#</Data>
							</Cell>
						</Row>
						'>
				</cfif>
				<cfset o = o + 1>
				<!--- loop through indicators --->
				<cfloop from="1" to="#ArrayLen(a_indicators)#" index="i">
					<!--- CHART --->
					<cfoutput><div class="chart"></cfoutput>
						<cfoutput><h4>#a_indicators[i].INDCATR_TITLE[1]#</h4></cfoutput>
						<cfif a_indicators[i].INDCATR_TYPE[1] IS 1>
							<cfset s_chart = "../css/xml/percent.xml">
						<cfelse>
							<cfset s_chart = "../css/xml/normal.xml">
						</cfif>
						<cfchart style="#s_chart#" chartWidth="630" chartHeight="500" format="png">
							<!--- chartseries expects a query string (obtained from above) --->
							<cfchartseries type="line" 
								query="q_indicators_#i#" 
								itemcolumn="PERIOD_TITLE" 
								valuecolumn="ENTRY_TOTAL" 
								serieslabel="Indicators"
								/>
						</cfchart>
					<cfoutput></div></cfoutput>

					<!--- TABLE --->
					<cfoutput>
						<div class="frm frm_tab">
							<table width="100%">
								<col width="40%"/>
								<col width="20%"/>
								<col width="20%"/>
								<cfif lCase(request.s_action) IS "group"><col width="20%"></cfif>
								<!--- indicator title --->
								<tr>
									<cfif lCase(request.s_action) IS "group"><td colspan="4"><cfelse><td colspan="3"></cfif><h4>#a_indicators[i].INDCATR_TITLE[1]#</h4></td>
								</tr>
								<!--- header --->
								<tr>
									<td class="emp"><h5>Reporting Period</h5></td>
									<td class="emp"><h5>Percentage Score (mean)</h5></td>
									<td class="emp"><h5>Number of Patients (n)</h5></td>
									<cfif lCase(request.s_action) IS "group"><td class="emp"><h5>Number of Providers</h5></td></cfif>
								</tr>
					</cfoutput>
								<cfset s_xml = s_xml & '
										<Row ss:Height="25.0">
											<Cell colspan="4" ss:StyleID="topHeading">
												<Data ss:Type="String">#a_indicators[i].INDCATR_TITLE[1]#</Data>
											</Cell>
										</Row>
										<Row ss:Height="36.0">
											<Cell ss:StyleID="hdr"><Data ss:Type="String">Reporting Period</Data></Cell>
											<Cell ss:StyleID="hdr"><Data ss:Type="String">Percentage Score (mean)</Data></Cell>
											<Cell ss:StyleID="hdr"><Data ss:Type="String">Number of Patients (n)</Data></Cell>
											<Cell ss:StyleID="hdr"><Data ss:Type="String">Number of Providers</Data></Cell>
										</Row>
									'>
							
								<cfset l_period_ids = "">
								<cfset l_entry_index = "">
								<cfset k = 1>
								<!--- loop through query indicators for... --->
								<cfloop query="q_indicators_#i#">
									<cfset s_x_type = "#INDCATR_TYPE#">
									<!--- entry indeces --->
									<cfset l_entry_index = ListAppend(l_entry_index, k)>
									<!--- period ids NOTE: this length SHOULD match l_entry_index above for it to work properly! --->
									<cfset l_period_ids = ListAppend(l_period_ids, PERIOD_ID)>
									<cfset k = k + 1>
								</cfloop>
								<!--- loop through periods --->
								<cfloop from="1" to="#ArrayLen(a_periods)#" index="j">
									<cfset i_curr_mean = "">
									<cfset i_curr_num = "">
									<cfset i_curr_denom = "">
									<cfset i_num_provider = "">
									<!--- get index period id --->
									<cfset i_find = ListFindNoCase(l_period_ids, a_periods[j].value)>
									<!--- set mean percentage and numerator --->
									<cfif i_find>
										<cfset i_curr_num = a_indicators[i].NUMERATOR[ListGetAt(l_entry_index, i_find)]>
										<cfset i_curr_denom = a_indicators[i].DENOMINATOR[ListGetAt(l_entry_index, i_find)]>
										<cfset i_curr_mean = a_indicators[i].ENTRY_TOTAL[ListGetAt(l_entry_index, i_find)]>
										<cfif a_indicators[i].INDCATR_TYPE[ListGetAt(l_entry_index, i_find)] IS 1>
											<cfset i_curr_mean = i_curr_mean & "%">
										<cfelse>
											<cfset i_curr_mean = "N/A">
											<cfset i_curr_denom = i_curr_num>
										</cfif>
										<cfif lCase(request.s_action) IS "group">
											<cfset i_num_provider = a_indicators[i].NUM_PROVIDER[ListGetAt(l_entry_index, i_find)]>
										</cfif>
									</cfif>
									<cfset s_td_denom = "">
									<cfset s_td_provider = "">
									<cfif Len(i_curr_denom)>
										<cfset s_td_denom = NumberFormat(i_curr_denom, ",")>
									</cfif>
									<cfif Len(i_num_provider)>
										<cfset s_td_provider = NumberFormat(i_num_provider, ",")>
									</cfif>
									<!--- output cells --->
									<cfoutput>
										<tr>
											<td class="emp"><h5>#a_periods[j].text#</h5></td>
											<td align="center"><h4>#i_curr_mean#</h4></td>
											<td align="center"><h4>#s_td_denom#</h4></td>
											<cfif lCase(request.s_action) IS "group"><td align="center"><h4>#s_td_provider#</h4></td></cfif>
										</tr>
									</cfoutput>
									<cfset s_xml = s_xml & '
										<Row>
											<Cell ss:StyleID="hline"><Data ss:Type="String">#a_periods[j].text#</Data></Cell>'>
										
										<cfif i_curr_mean IS "N/A">
											<cfset s_xml = s_xml & '<Cell><Data ss:Type="String">#i_curr_mean#</Data></Cell>'>
										<cfelseif Len(i_curr_mean)>
											<cfif s_x_type IS 1>
												<cfset i_curr_mean = Val(i_curr_mean) / 100>
											</cfif>
											 <cfset s_xml = s_xml & '<Cell ss:StyleID="type#s_x_type#"><Data ss:Type="Number">#i_curr_mean#</Data></Cell>'>
										<cfelse>
											<cfset s_xml = s_xml & '<Cell><Data ss:Type="String">#i_curr_mean#</Data></Cell>'>
										</cfif>
										
										<cfif Len(i_curr_denom)>
											<cfset s_xml = s_xml & '<Cell><Data ss:Type="Number">#i_curr_denom#</Data></Cell>'>
										<cfelse>
											<cfset s_xml = s_xml & '<Cell><Data ss:Type="String">#i_curr_denom#</Data></Cell>'>
										</cfif>
										
										<cfif lCase(request.s_action) IS "group">
											<cfif Len(i_num_provider)>
												<cfset s_xml = s_xml & '<Cell><Data ss:Type="Number">#i_num_provider#</Data></Cell>'>
											<cfelse>
												<cfset s_xml = s_xml & '<Cell><Data ss:Type="String"></Data></Cell>'>
											</cfif>
										</cfif>
										<cfset s_xml = s_xml & '</Row>'>
								</cfloop>
								
						
					<cfoutput>
							</table>
						</div><br><br>
					</cfoutput>
				</cfloop>
				<cfset s_xml = s_xml & '</Table></Worksheet>'>
		
			
		</cfif>
		</cfloop>
		<cfset s_xml = s_xml & '</Workbook>'>
		<cfoutput>
			<form name="x_form" action="../../excel/excel_results.cfm" method="post" target="_blank">
				<input type="hidden" name="xdata" value="#URLEncodedFormat(s_xml)#">
				<input type="hidden" name="page" value="#request.s_action#_report">
			</form>
		</cfoutput>
		
		<!--- only show export to excel link if records are returned --->
		<cfif NOT b_noentries>
			<cfset request.a_links = ArrayNew(1)>
			<cfset request.a_links[1] = StructNew()>
			<cfset request.a_links[1].text = "Export to Excel">
			<cfset request.a_links[1].link = "javascript:document.x_form.submit()">
			<cfset request.a_links[2] = StructNew()>
			<cfset request.a_links[2].text = "Print Report">
			<cfset request.a_links[2].link = "javascript:window.print()">
		</cfif>
	</cfif>
</cfif>

<cfsetting enablecfoutputonly="No">