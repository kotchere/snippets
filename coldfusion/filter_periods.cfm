<cfsetting enablecfoutputonly="Yes">
<!----------------------------------------------------------------
Template: filter_periods.cfm

Date created: 08/14/2011

Author: Kwaku Otchere 

Type: Template

Description: 

Related files:
----------------------------------------------------------------->
<cfoutput>
			<tr>
				<td colspan="6" class="emp"><h4>Please check period(s) to display:</h4></td>
			</tr>
</cfoutput>
		<!--- BENCHMARK FILTERS --->
		
		<!--- states --->
		<cfinvoke component="#application.g.s_path_components#.navigation" method="get_states" returnvariable="a_states">
		<!--- facilities --->
		<cfinvoke component="#application.g.s_path_components#.navigation" method="get_facilities" returnvariable="a_facilities">
		<!--- parts --->
		<cfinvoke component="#application.g.s_path_components#.navigation" method="get_ryanwhite" returnvariable="a_parts">
			
		<!--- prepend array lists --->
		<cfset st_tmp = StructNew()>
		<cfset st_tmp.value = "">
		<cfset st_tmp.text = "------">
		<cfset tmp = ArrayPrepend(a_states, st_tmp)>
		<cfset tmp = ArrayPrepend(a_facilities, st_tmp)>
		<cfset tmp = ArrayPrepend(a_parts, st_tmp)>
		
		<cfparam name="s_print_filter" default="">
	
		<cfif StructKeyExists(request, "s_action") AND lCase(request.s_action) IS "benchmark">
			<!--- print only --->
			<cfif Len(form.sel_states)>
				<cfset s_print_filter = s_print_filter & '<strong>State:</strong> #form.sel_states#<br>'>
			</cfif>
			<cfif Len(form.sel_parts)>
				<cfset s_print_filter = s_print_filter & '<strong>Part:</strong> #form.sel_parts#<br>'>
			</cfif>
			<cfif Len(form.sel_facilities)>
				<cfset s_print_filter = s_print_filter & '<strong>Facility Type:</strong> #form.sel_facilities#<br>'>
			</cfif>
			
			<!--- display --->
			<cfoutput>
				<tr>
					<td colspan="2">
						<strong>State:</strong><br>
						<cfinvoke component="#application.g.s_path_components#.ui" method="set_field" 
							s_name="sel_states" o_extra="#a_states#" s_type="select" s_value="#form.sel_states#" b_text="false">
					</td>
					<td colspan="2">
						<strong>Part:</strong><br>
						<cfinvoke component="#application.g.s_path_components#.ui" method="set_field" 
							s_name="sel_parts" o_extra="#a_parts#" s_type="select" s_value="#form.sel_parts#" b_text="false">
					</td>
					<td colspan="2">
						<strong>Facility Type:</strong><br>
						<cfinvoke component="#application.g.s_path_components#.ui" method="set_field" 
							s_name="sel_facilities" o_extra="#a_facilities#" s_type="select" s_value="#form.sel_facilities#" b_text="false" i_width="200">
					</td>
				</tr>
				<tr>
					<td colspan="6">
		
					</td>
				</tr>
			</cfoutput>
		</cfif>
		
		<cfset s_print_filter = s_print_filter & '<strong>Periods to display: </strong>'>
		
		<cfset i = 1>
		<cfloop condition="i LTE #ArrayLen(a_periods)#">
			<!--- display --->
			<cfoutput><tr></cfoutput>
				<cfloop from="1" to="3" index="j">
					<cfif i LTE ArrayLen(a_periods)>
						<!--- print only --->
						<cfif ListFindNoCase(form.check_period, a_periods[i].value)>
							<cfset s_print_filter = s_print_filter & '#a_periods[i].text#' & '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'>
						</cfif>
						
						<cfoutput><td>
							<cfinvoke component="#application.g.s_path_components#.ui" 
								method="set_field" 
								s_name="check_period" 
								s_value="#a_periods[i].value#" 
								s_type="checkbox" 
								o_extra="#form.check_period#" 
								b_text="false">
							</td>
						</cfoutput>
						<cfoutput><td class="vtop"><h5>#a_periods[i].text#</h5></td></cfoutput>
					<cfelse>
						<cfoutput><td>&nbsp;</td></cfoutput>
						<cfoutput><td>&nbsp;</td></cfoutput>
					</cfif>
					<cfset i = i + 1>
				</cfloop>
			<cfoutput></tr></cfoutput>
		</cfloop>
		
		<cfoutput>
			<tr>
				<td><input type="checkbox" value="all" name="check_display_all" id="check_display_all"></td>
				<td colspan="5">
					<strong>Display All</strong>
				</td>
			</tr>
		</cfoutput>


<cfsetting enablecfoutputonly="No">