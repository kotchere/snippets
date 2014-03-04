<cfsetting enablecfoutputonly="Yes">
<!----------------------------------------------------------------
Template: checktype.cfm

Date created: 08/08/2011

Author: Kwaku Otchere kotchere@webworldtech.com

Type: Template

Description: 

Related files:
----------------------------------------------------------------->
<!--- copy arguments to local scope --->
<cfset arguments = variables.arguments>
<cfloop collection="#arguments#" item="key">
	<cfset temp = SetVariable(key,arguments[key])>
</cfloop>

<!--- required --->
<cfif b_required>
	<cfset l_classes = ListAppend(l_classes, 'required')>
</cfif>

<!--- title --->
<cfif Len(ttip)>
	<cfset s_title = 'title="#ttip#"'>
	<cfset l_classes = ListAppend(l_classes, 'ttip')>
<cfelse>
	<cfset s_title = "">
</cfif>

<!--- classes --->
<cfset s_classes = "">
<cfif ListLen(l_classes)>
	<cfset s_classes = ' class="' & Replace(l_classes, ",", " ", "ALL") & '"'>
</cfif>

<cfif b_text AND Len(s_text)>
	<cfset s_value = s_text>
	<cfoutput>#s_text#</cfoutput>
</cfif>

<!--- width --->
<cfset s_width="">
<cfif i_width>
	<cfset s_width='width:#i_width#px !important'>
</cfif>
<cfswitch expression="#s_type#">
	<!--- text --->
	<cfcase value="text">
		<cfif b_text>
			<cfoutput>#s_value#</cfoutput>
		<cfelse>
			<cfoutput><input type="text" name="#s_name#" id="#s_name#" value="#s_value#"#s_classes# style="#s_width#" #s_title#></cfoutput>
		</cfif>
	</cfcase>
	
	<!--- textarea --->
	<cfcase value="textarea">
		<cfif b_text>
			<cfoutput>#s_value#</cfoutput>
		<cfelse>
			<cfoutput><textarea name="#s_name#" id="#s_name#"#s_classes# style="#s_width#">#s_value#</textarea></cfoutput>
		</cfif>
	</cfcase>
	
	<!--- password --->
	<cfcase value="password">
		<cfif b_text>
			<cfoutput>#RepeatString("*",Len(s_value))#</cfoutput>
		<cfelse>
			<cfoutput><input type="password" name="#s_name#" value="#s_value#"#s_classes# style="#s_width#"></cfoutput>
		</cfif>
		
	</cfcase>
	<!--- select --->
	<cfcase value="select,select-multi">
		<cfset s_temp_multi = "">
		<cfif s_type IS "select-multi">
			<cfset s_temp_multi = " multiple=""multiple""">
		</cfif>
		<cfif NOT b_text><cfoutput><select id="#s_name#" name="#s_name#"#s_temp_multi##s_classes# style="#s_width#"></cfoutput></cfif>
		<cfif isArray(o_extra)>
			<cfloop from="1" to="#ArrayLen(o_extra)#" index="i">
				<!--- if o_extra doesn't have a text/value struct, then use it's index instead --->
				<cfif NOT isStruct(o_extra[i])>
					<cfset tmp = StructNew()>
					<cfset tmp.text = o_extra[i]>
					<cfset tmp.value = Trim(o_extra[i])>
					<cfset o_extra[i] = tmp>
				</cfif>
				<cfset s_temp_selected = "">
				<cfif ListFindNoCase(s_value, o_extra[i].value)>
					<cfset s_temp_selected = " selected">
					<cfif b_text>
						<cfoutput>#o_extra[i].text#<cfif #ListLen(s_value)# GT 1 AND ListLen(s_value) IS NOT i><br></cfif></cfoutput>
					</cfif>
				</cfif>
				<cfif NOT b_text>
					<cfoutput>
						<option value="#o_extra[i].value#"#s_temp_selected#>#o_extra[i].text#</option>
					</cfoutput>
				</cfif>
			</cfloop>
		</cfif>
		<cfif NOT b_text><cfoutput></select></cfoutput></cfif>
	</cfcase>
	
	<!--- radio --->
	<cfcase value="radio">
		<cfset s_temp_checked = "">
		<cfif o_extra IS s_value>
			<cfset s_temp_checked = " checked">
			<cfif b_text>
				<cfoutput><span class="check">&##10003;</span></cfoutput>
			</cfif>
		</cfif>
		<cfif NOT b_text>
			<cfoutput><input type="radio" id="#s_name#_#s_value#" name="#s_name#" value="#s_value#"#s_temp_checked##s_classes#></cfoutput>
		</cfif>
	</cfcase>
	
	<!--- row --->
	<!--- this is really for checkbox values and only outputs when the value exists in an array of possible values --->
	<!--- outputs a class hide/show --->
	<cfcase value="string">
		<cfif b_text>
			<cfif ListLen(o_extra) AND ListFindNoCase(o_extra, s_value)>
				<cfoutput>show</cfoutput>
			<cfelse>
				<cfoutput>hide</cfoutput>
			</cfif>
		</cfif>
	</cfcase>
	
	<!--- checkbox --->
	<cfcase value="checkbox">
		<cfset s_temp_checked = "">
		<cfif ListLen(o_extra) AND ListFindNoCase(o_extra, s_value)>
			<cfset s_temp_checked = " checked">
			<cfif b_text>
				<!--- checkmark --->
				<cfoutput><span class="check">&##10003;</span></cfoutput>
			</cfif>
		</cfif>
		<cfif NOT b_text>
			<cfoutput><input type="checkbox" id="#s_name#_#s_value#" name="#s_name#" value="#s_value#"#s_temp_checked##s_classes#></cfoutput>
		</cfif>
	</cfcase>
</cfswitch>

<cfsetting enablecfoutputonly="No">