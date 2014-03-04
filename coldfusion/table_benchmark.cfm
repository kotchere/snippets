<cfsetting enablecfoutputonly="Yes">
<!----------------------------------------------------------------
Template: table_benchmark.cfm

Date created: 08/18/2011

Author: Kwaku Otchere @ webworldtech.com

Type: Template

Description: 

Related files:
----------------------------------------------------------------->
<!--- get periods --->
<cfinvoke component="#application.g.s_path_components#.navigation" method="get_periods" returnvariable="a_periods">
<cfset s_xml = s_xml & '<Worksheet ss:Name="Sheet #i_z#">'>
<cfset s_table = '<table>'>
<cfset s_x_type = st_ind[s_key]["type"]>

<!--- the extra 2 for the legend columns --->
<cfset i_col_num = ArrayLen(a_periods) + 2>
<cfset i_col_width = Round(100 / i_col_num)>
<cfset s_xml = s_xml & '<Table ss:ExpandedColumnCount="#i_col_num#" ss:ExpandedRowCount="17" x:FullColumns="1" x:FullRows="1">'>

<cfloop from="1" to="#i_col_num#" index="k">
	<cfset s_table = s_table & '<col width="#i_col_width#%"/>'>
	<cfset i_x_width = 80>
	<cfif k LTE 2>
		<cfset i_x_width = 120>
	</cfif>
	<cfset s_xml = s_xml & '<Column ss:Index="#k#" ss:Width="#i_x_width#" />'>
</cfloop>

<cfset b_start_xml = false>
<cfset s_table = s_table & '
	<tr>
		<td colspan="#i_col_num#"><h4>#st_ind[s_key]["title"]#</h4></td>
	</tr>
	<tr>
		<td class="emp"><h5></h5></td>
		<td class="emp"><h5></h5></td>
	'>
<cfset s_xml = s_xml & '
	<Row ss:Height="25.0">
		<Cell colspan="#i_col_num#" ss:StyleID="topHeading">
			<Data ss:Type="String">#st_ind[s_key]["title"]#</Data>
		</Cell>
	</Row>
	<Row ss:Height="36.0">
		<Cell><Data ss:Type="String"></Data></Cell>
		<Cell><Data ss:Type="String"></Data></Cell>'>
	<cfloop from="1" to="#ArrayLen(a_periods)#" index="k">
		<cfset s_table = s_table & '<td class="emp"><h5>#a_periods[k].text#</h5></td>'>
		<cfset s_xml = s_xml & '<Cell ss:StyleID="hdr"><Data ss:Type="String">#a_periods[k].text#</Data></Cell>'>
	</cfloop>
	<cfset s_table = s_table & '</tr>'>
	<cfset s_xml = s_xml & '</Row>'>
<cfset k=1>
<cfloop list="#l_modes#" index="s_mode2">
	<!--- mean --->
	<cfset s_table = s_table & '
		<tr>
			<td class="emp"><h5>#ListGetAt(l_names, k)#</h5></td>
			<td align="center"><h5>%=mean</h5></td>'>
	<cfset s_xml = s_xml & '
		<Row>
			<Cell ss:StyleID="hline"><Data ss:Type="String">#ListGetAt(l_names, k)#</Data></Cell>
			<Cell><Data ss:Type="String">%=mean</Data></Cell>'>
			
			<cfloop from="1" to="#ArrayLen(a_periods)#" index="j">
				<cfset s_value = "">
				<cfset s_td_value = "">
				<cfset s_data = "_" & s_mode2 & "_mean">
				
				<cfif StructKeyExists(st_my_indicator[s_key], a_periods[j].value) AND StructKeyExists(st_my_indicator[s_key][a_periods[j].value], s_data)>
					<cfset s_value = st_my_indicator[s_key][a_periods[j].value][s_data]>
					<cfif FindNoCase(".", s_value)>
						<cfset s_value = DecimalFormat(s_value)>
					</cfif>
				</cfif>
				<cfset s_td_value = s_value>
				<cfif s_x_type IS 1 AND Len(s_value)>
					<cfset s_td_value = s_value & "%">
				</cfif>
				<cfset s_table = s_table & '<td align="center"><h4>#s_td_value#</h4></td>'>
				<cfif Len(s_value)>
					<cfset s_xml = s_xml & '<Cell ss:StyleID="type#s_x_type#"><Data ss:Type="Number">#(s_value/100)#</Data></Cell>'>
				<cfelse>
					<cfset s_xml = s_xml & '<Cell><Data ss:Type="String"></Data></Cell>'>
				</cfif>
			</cfloop>
	<!--- patients --->
	<cfset s_table = s_table & '
		</tr>
		<tr>
			<td class="emp"><h5></h5></td>
			<td align="center"><h5>n=patients</h5></td>'>
	<cfset s_xml = s_xml & '
		</Row>
		<Row>
			<Cell><Data ss:Type="String"></Data></Cell>
			<Cell><Data ss:Type="String">n=patients</Data></Cell>'>
			
			<cfloop from="1" to="#ArrayLen(a_periods)#" index="j">
				<cfset s_value = "">
				<cfset s_td_value = "">
				<cfset s_data = "_" & s_mode2 & "_patients">
				<cfif StructKeyExists(st_my_indicator[s_key], a_periods[j].value) AND StructKeyExists(st_my_indicator[s_key][a_periods[j].value], s_data)>
					<cfset s_value = st_my_indicator[s_key][a_periods[j].value][s_data]>
				</cfif>
				<cfif Len(s_value)>
					<cfset s_td_value = NumberFormat(s_value, ",")>
				</cfif>
				<cfset s_table = s_table & '<td align="center"><h4>#s_td_value#</h4></td>'>
				<cfif Len(s_value)>
					<cfset s_xml = s_xml & '<Cell><Data ss:Type="Number">#s_value#</Data></Cell>'>
				<cfelse>
					<cfset s_xml = s_xml & '<Cell><Data ss:Type="String"></Data></Cell>'>
				</cfif>
			</cfloop>
	<!--- organizations --->
	<cfset s_table = s_table & '
		</tr>
		<tr class="divider">
			<td class="emp"><h5></h5></td>
			<td align="center"><h5>p=organizations</h5></td>'>
	<cfset s_xml = s_xml & '
		</Row>
		<Row>
			<Cell><Data ss:Type="String"></Data></Cell>
			<Cell><Data ss:Type="String">p=organizations</Data></Cell>'>
			<cfloop from="1" to="#ArrayLen(a_periods)#" index="j">
				<cfset s_value = "">
				<cfset s_td_value = "">
				<cfset s_data = "_" & s_mode2 & "_org">
				<cfif StructKeyExists(st_my_indicator[s_key], a_periods[j].value) AND StructKeyExists(st_my_indicator[s_key][a_periods[j].value], s_data)>
					<cfset s_value = st_my_indicator[s_key][a_periods[j].value][s_data]>
				</cfif>
				<cfif Len(s_value)>
					<cfset s_td_value = NumberFormat(s_value, ",")>
				</cfif>
				<cfset s_table = s_table & '<td align="center"><h4>#s_td_value#</h4></td>'>
				<cfif Len(s_value)>
					<cfset s_xml = s_xml & '<Cell><Data ss:Type="Number">#s_value#</Data></Cell>'>
				<cfelse>
					<cfset s_xml = s_xml & '<Cell><Data ss:Type="String"></Data></Cell>'>
				</cfif>
				
			</cfloop>
	<cfset s_table = s_table & '</tr>'>
	<cfset s_xml = s_xml & '</Row>'>
	<cfset k = k + 1>
</cfloop>
<cfset s_table = s_table & '</table>'>
<cfset s_xml = s_xml & '</Table></Worksheet>'>
<cfoutput>
	<div class="frm frm_tab">
		#s_table#
	</div>
</cfoutput>
<cfsetting enablecfoutputonly="No">