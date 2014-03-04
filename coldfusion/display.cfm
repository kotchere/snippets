<cfsetting enablecfoutputonly="Yes">
<!----------------------------------------------------------------
Template: display.cfm

Date created: 08/06/2011

Type: Template

Description: 

Related files:
----------------------------------------------------------------->
<!--- copy arguments to local scope --->
<cfset arguments = variables.arguments>
<cfloop collection="#arguments#" item="key">
	<cfset temp = SetVariable(key,arguments[key])>
</cfloop>

<cfparam name="s_page_title" default="in+care DB">
<cfparam name="l_crumb" default="">
<cfparam name="s_help" default="">

<cfif isDefined("s_page")>
	<!--- default page to "welcome" page --->
	<cfif NOT Len(s_page)>
		<cfset s_page = "welcome">
	</cfif>
	
	<!--- get page content --->
	<cfsavecontent variable="s_page_content">
		<cfinclude template="../../pages/#s_page#.cfm">
	</cfsavecontent>
</cfif>

<!--- crumb --->
<cfinvoke component="#application.g.s_path_components#.navigation" method="crumb" l_crumb="#l_crumb#" returnvariable="s_crumb">	


<!--- html --->
<cfoutput>
	<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN"
		"http://www.w3.org/TR/html4/strict.dtd">
	<html>
		<head>
			<meta http-equiv="Content-type" content="text/html; charset=utf-8">
			<title>#s_page_title#</title>
			<script src="#application.g.s_path_base#/js/jquery-1.6.1.min.js" type="text/javascript" charset="utf-8"></script>
			<script src="#application.g.s_path_base#/js/pixelmatrix-uniform-2446d99/jquery.uniform.js" type="text/javascript" charset="utf-8"></script>
			<script src="#application.g.s_path_base#/js/jquery.validate.js" type="text/javascript" charset="utf-8"></script>
			<script src="#application.g.s_path_base#/js/jquery.numeric.js" type="text/javascript" charset="utf-8"></script>
			<script src="#application.g.s_path_base#/js/jquery.tools.min.js" type="text/javascript" charset="utf-8"></script>
			<script src="#application.g.s_path_base#/js/nn.js" type="text/javascript" charset="utf-8"></script>
			<link rel="stylesheet" href="#application.g.s_path_base#/js/pixelmatrix-uniform-2446d99/css/uniform.default.css" type="text/css" media="screen" title="no title" charset="utf-8">
			<link rel="stylesheet" href="#application.g.s_path_base#/css/ncrp.css" type="text/css" media="screen" title="no title" charset="utf-8">
			<link rel="stylesheet" href="#application.g.s_path_base#/css/print.css" type="text/css" media="print" charset="utf-8">
		</head>
		<body class="p_#s_page#">
			<cfif NOT StructKeyExists(url, "n")>
					<!--- header links (show only when logged in) --->
					<cfif StructKeyExists(session, "b_loggedin") AND session.b_loggedin>
						<cfinclude template="../../includes/_header.cfm">
					</cfif>
					<div id="wrapper">
						<div id="banner" class="ban_#s_page#">
							#s_crumb#
							<div id="logo"></div>
						</div>
						<div id="main">
							<div id="content" class="page_#request.s_page#">
								<cfif isDefined("b_admin") AND b_admin>
									<cfif session.st_user.b_admin IS 1>
										#s_page_content#
									<cfelse>
										<cfoutput><strong>Sorry, you need admin access to view this page.</strong></cfoutput>
									</cfif>
								<cfelse>
									#s_page_content#
								</cfif>
							</div>
						</div>
						<!--- side nav/tips --->
						<cfinvoke component="#application.g.s_path_components#.page" method="side" s_help="#s_help#">	
					</div>
			</cfif>
		</body>
	</html>
</cfoutput>

<cfsetting enablecfoutputonly="No">