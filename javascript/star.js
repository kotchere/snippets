/*****************************************************************
Template: star.js

Date created: 06/10/2006

Author: Andrew Hewitt andrew@webworldtech.com
		Kwaku Otchere kotchere@webworldtech.com

Type: Javascript

Description: Main js file that contains all the code common to the browser side of the application.
			It also contains the code that loads, shows and switches sections and their accompanying
			js code

Related files:
	index.cfm
*****************************************************************/

// declare our own namespace to group our application objects and methods
if (typeof star == "undefined") star = {};

// initialize function
star.init = function() {
	
	// Below are options you can set for how the application behaves
	
	// The application uses a one page system that calls out to the server for pages and data
	// and loads that into the browser. It will cache each section loaded. The number below
	// limits the number of sections cached. Once the limit is reached then newly requested
	// sections will push out the least recently used section out of the cache
	star.i_num_sects_2_cache = 2;
	
	star.i_recs_per_page = 25; // number of records to show per page
	
	star.d_lastActChange = new Date(); // date of last retrieve of activities
	
	star.i_sessionTimeout = 60; // number of minutes the session lasts
	star.s_sessionTimeout = '1 hour' // string representation of the session timeout
	star.i_sessionWarning = 58; // number of minutes before showing the user a warning that their session is about to end
	// timeout for transaction calls to the server (in milliseconds)
	star.i_XHRTimeout = 120000;
	
	// default date format
	star.s_date_format = 'M j, Y';
	// alternate acceptable formats for dates
	star.l_date_altFormats = 'm/d/y|m/d/Y|n/j/y|n/j/Y|F j, Y|d/m/y|d/m/Y|j/n/y|j/n/Y';
	
	star.Utils.updateExt(); // add/override necessary Ext functions
	
	// setup the app's templates
	star.Utils.setTemplates();
	
	// set the animation image
	star.img_anim = '<img src="images/loading.gif" border="0" width="16" height="16" align="absmiddle" title="loading..." />';
	
	//enable quick tips
	//Ext.QuickTips.init();
	
	//default msgbox to brown theme
	if(!Ext.MessageBox.getDialog().getEl().hasClass('t-brown'))
		Ext.MessageBox.getDialog().getEl().addClass('t-brown');
	
	// star vars
	star.s_url = 'gateway/index.cfm';
	// create connection object pointing to the server with default options
	// to overide these options pass them in when you do a $conn.request({options})
	$conn = new Ext.data.Connection({url: star.s_url, method: 'GET', timeout: star.i_XHRTimeout});
	/* TODO: The page loads and then a call is made to load the user and the current section. 
	 * Should show a loading indicator in the body during this time */

	/* Overides console object for IE */
	if(Ext.isIE)
		console = function(){
			return {
				info: function(s_msg){}
				,log: function(s_msg){}
			};
		}();
		
	// if we are activating a user account then show that panel, if not then
	// continue initializing
	if(!star.Security.activateUser() && !star.Security.resetPassword()) {
		// get the current user's session and load the correct section depending on
		star.Security.getCurrentUser();
	}
	
}; // end star.init

star.Activity = function(o_item) {
	//if string is passed in, then make that the id, else apply all the properties to "this"
	if(Ext.type(o_item) == "string")
		this.s_id = o_item;
	else
		Ext.apply(this, o_item);
		
	//apply defaults
	Ext.applyIf(this, {s_cd:'A'});
	
};// end star.Activity

star.Activity.prototype = {
	buildDialog: function(anim_el, o_this){ // builds the activity dialog
		if(this.s_cd == 'A' || this.s_cd == 'I')
			this.dlg = star.mainDialog;
		else
			this.dlg = star.subDialog;
		
		var s_type_name = "Activity";
		if(this.s_cd == "R") s_type_name = "Result";
		if(this.s_cd == "O") s_type_name = "Addon";
		if(this.s_cd == "I") s_type_name = "IIP Result";
		
		this.s_type_name = s_type_name;
		
		var a_tabs = [{ s_name:'tab_edit_' + this.s_cd, s_title:s_type_name }];
		this.start_tab = 'tab_edit_' + this.s_cd;
		
		//if IIP results, show only view acty tab, and NOT edit tab
		if(this.s_cd == "I") {
			this.start_tab = 'tab_acty_I';
			a_tabs = [{s_name:'tab_acty_I', s_title: s_type_name}];
		}
		else {
			//if not creating a new one, add 'tab_acty' as the first tab
			if(!this.b_new) {
				this.start_tab = 'tab_acty_' + this.s_cd;
				a_tabs.unshift({s_name:'tab_acty_' + this.s_cd, s_title:s_type_name});
			}
		}
		
		var i_width = 0;
		var i_height = 0;
		//make other dialogs smaller than the activity dialog
		if(this.s_cd && this.s_cd != "A" && this.s_cd != 'I') {
			i_width = star.mainDialog.getSize().width - 50;
			i_height = star.mainDialog.getSize().height - 50;
		}
		
		var s_title = 'Retrieving ' + s_type_name;
		if(this.b_new)
			s_title = 'Creating ' + s_type_name;
		this.dlg.build({
			s_title: s_title + ' ...'
			,activeTab: this.start_tab
			,a_tabs: a_tabs
			,i_width: i_width
			,i_height: i_height
		});
		
		// hide edit tab if necessary
		if(!this.b_new && this.s_cd != "I"){
			this.dlg.getTabs().on("render", function() {
				this.dlg.getTabs().hideTabStripItem('tab_edit_' + this.s_cd);
			}, this, {single:true});
		}
			//this.dlg.getLayout().regions.center.hidePanel(this.dlg.o_panels.tab_edit.outerLayout);

		// show the main dialog with the activity panels
		if(anim_el)
			this.dlg.show(anim_el);
		else
			this.dlg.show();
				
		
		this.dlg.on("hide", function() {
			/* if(this.menu_send) {
				this.menu_send.removeAll();
				this.menu_send.getEl().remove();
				this.menu_send.purgeListeners();
			}
			if(this.menu_notify) {
				this.menu_notify.removeAll();
				this.menu_notify.getEl().remove();
				this.menu_notify.purgeListeners();
			} */
			/* if(this.frm_acty) {
				Ext.get('acty_frm_' + this.s_cd).remove();
				this.frm_acty.purgeListeners();
			}
			//this.dlg.footer.remove();
			this.dlg.purgeListeners(); */
			//this.dlg.getTabs().purgeListeners();
			//this.dlg.getTabs().destroy();
			this.dlg = null;
			
		}, this, {single:true});
		
	}
	
	,buildEditForm: function(el) {
		
		// set title of the dialog
		this.dlg.setTitle(this.acty_type_nm);
		
		// reset template object for reuse
		this.o_template_data = {
			frm_name:'acty_frm_' + this.s_cd, s_type:this.s_type_name,
			acty_nm_field:'acty_nm_' + this.s_cd,
			acty_nm:this.st_acty_changes ? this.st_acty_changes.acty_nm : this.st_acty.acty_nm, // use changed activity name if any
			acty_id:this.st_acty.acty_id,
			acty_type_nm:this.acty_type_nm,
			acty_type_id:this.acty_type_id,
			s_taskID:this.s_task_id
		};
		// escape quotes from the activity name so the template works
		this.o_template_data.acty_nm = this.o_template_data.acty_nm.replace('"','&quot;','g');
		
		//edit the basic details (start date, end date, highlight)
		this.o_template_data.details = this.o_template_data.highlight = [];
		if(this.s_cd == 'A')
			this.editDetails();
		
		//edit questions and answers
		this.editQnA();
				
		//move the tab's body offscreen so that it doesn't cause the dialog to go white
		el.dom.style.left = -1000;
		el.dom.style.top = -1000;
		
		// overwrite the body of the panel with the acty template
		star.tpl_acty_form.overwrite(el,this.o_template_data);
		
		//transform to ext form
		this.editForm();
		
		// place the tab's body back in place
		el.dom.style.left = 0;
		el.dom.style.top = 0;
		
		// build the buttons for this form
		this.setButtons4Form(el);
		
		//remove mask
		this.dlg.body.unmask.defer(10,this.dlg.body,[true]);
		
	}
	
	//check start and end dates
	,checkDates: function(b_approve, s_start_dt, s_end_dt) {
		this.s_msg_date = '';
		//var s_start_dt = this.frm_acty ? Ext.getDom('acty_start_dt').value : this.st_acty.acty_start.dt;
		//var s_end_dt = this.frm_acty ? Ext.getDom('acty_end_dt').value: this.st_acty.acty_end_dt;
		
		s_start_dt = new Date(s_start_dt);
		s_end_dt = new Date(s_end_dt);
		//alert(s_start_dt);
		//alert(s_end_dt);
		if(this.s_cd == 'A') {
			if(s_end_dt < s_start_dt) {
				this.s_msg_date = "The end date cannot be less than the start date";
				return false;
			}
			//if approving an activity, the start date cannot be later than today's date
			if(b_approve && s_start_dt > new Date()) {
				this.s_msg_date = "Cannot approve an activity with a future start date";
				return false;
			}
		}
		return true;
	}
	
	//check to make show required fields are not blank
	,checkRequired: function() {
		var s_required = '';
		var b_form = (Ext.get('acty_frm_' + this.s_cd)) ? true : false;
		this.validateSliderPercent();
		if(!this.s_valid)
			return "The sliders should add up to 100%";
		if(this.o_requiredFields) {
			for(var item in this.o_requiredFields) {
				if(this.o_requiredFields[item]) {
					var s_value = '';
					var s_title = this.o_requiredFields[item].title;
					if(b_form) {
						if(this.o_requiredFields[item].b_checkinput)
							s_value = Ext.getDom(item).value;
						else {
							console.log(item);
							s_value = this.frm_acty.findField(item).getValue();
						}
					}
					else
						s_value = this.o_requiredFields[item].value;
					if(this.o_requiredFields[item].b_nozero && s_value == 0)
						s_required += s_title + '<br>';
					else if(Ext.isEmpty(s_value))
						s_required += s_title + '<br>';
				}
			}
			if(s_required != '')
				return 'The following fields need to be filled in:<br>' + s_required;				
			else
				return false;
		}
		else
			return false;
	}
	
	,clone: function(config) {
		var tabs = this.dlg.getTabs();
		// remove result tab if it exists
		var rslt_tab = tabs.findById('tab_result');
		if(rslt_tab)
			tabs.remove(rslt_tab,true);
		// show the edit tab
		tabs.unhideTabStripItem('tab_edit_' + this.s_cd);
		this.start_tab = 'tab_edit_' + this.s_cd;
		// remove viewing tab since we'll be editing a form
		tabs.remove('tab_acty_' + this.s_cd,true);
		// var to indicate to the regular process that we are cloning
		this.b_clone = true;
		// set this to be new
		this.b_new = true;
		this.s_acty_type_id = config.s_acty_type_id;
		this.dlg.setTitle('Cloning Activity ...');
		// now run the regular create new process. this.b_clone will tell that process to keep cloneable rspns
		this.load();
		/* this.s_acty_type_id = config.s_acty_type_id;
		this.b_new = true;
		delete this.acty_type_nm;
		this.dlg.setTitle('Cloning Activity ...');
		console.log('cloning ' + this.s_acty_type_id);
		this.load(); */
		
	}
	
	//replace commas (this is especially for selectboxes - it errors when you get to saveActivity.cfm because the delimiter is a comma)
	,commaReplace: function(s_str) {
		return s_str.replace(new RegExp(',', "g"),'-');
	}
	
	//replace curly brackets with html coded character set
	,curlyReplace: function(s_str) {
		return s_str.replace(new RegExp('{', "g"),'&#123;').replace(new RegExp('}',"g"),'&#125;');
	}
	
	,create: function(el) {
		
		this.edit(el);

	}
	
	//delete activity
	,deleteActivity: function(s_acty_id) {
	
		var o_params = {
			s_resourceType: 'component',
			s_resource: 'activities',
			s_method: 'deleteActivity',
			s_actyID: s_acty_id
		}
		
		if(this.s_cd == "R")
			o_params.s_type = "results";
		
		Ext.MessageBox.confirm('Confirm', 'Are you sure you want to delete this ' + this.s_type_name + '?', 
			function(s_btn) {
				if(s_btn == "yes") {
					Ext.MessageBox.wait('Deleting ' + this.s_type_name + '...', 'Please wait...');
					
					$conn.request({
						params: o_params,
						callback: function(options,b_success,response) {
							if(b_success) {
								var o_response = Ext.decode(response.responseText);
								var o_data =  o_response.st_data;
								if(o_data.b_success) {
									$sect.sections[$sect.s_curr_sect].reloadGrid(true);
									//if results, remove from results grid
									if(this.s_cd == 'R')
										this.grid_ds.remove(this.o_grid_row);
									
									this.dlg.hide();
									// update the my task number if necessary
									if(typeof o_data.i_tasks != 'undefined')
										star.MyTasks.updateCount(o_data.i_tasks);
									
									Ext.MessageBox.alert('Status', this.s_type_name + ' has been deleted successfully');
								}
								else
									Ext.MessageBox.alert('The ' + this.s_type_name + ' could not be deleted');
							}
						},
						failure: function() {
							Ext.MessageBox.alert('The ' + this.s_type_name + ' could not be deleted');
						},
						scope:this
					});
				}
			}, this
		);
	}
	
	,edit: function(el){
		//apply mask
		this.dlg.body.mask('Building form...');
		
		this.buildEditForm.defer(1,this,[el]);
		
		//remove mask
		//this.dlg.body.unmask.defer(10,this.dlg.body,[true]);
		this.dlg.body.unmask.defer(2,this.dlg.body,[true]);
		
	}

	,editDetails: function(){		
		//details
		var st_obj = this.st_acty;
		st_obj.s_type_abbr = "acty";
		// use changes if there are any
		if(this.st_acty_changes)
			Ext.apply(st_obj,this.st_acty_changes);
		this.o_template_data.details = st_obj;
		
		//highlight
		if(this.b_allow_highlight) {
			st_obj.acty_hghlt = (st_obj.acty_hlght_ind == "Y") ? ' checked="checked"' : '';
			this.o_template_data.highlight = st_obj;
		}
	}
	
	//make ext form and apply all events, etc
	,editForm: function() {
		
		//console.info(this["frm_acty"]);
		var acty_frm = 'acty_frm_' + this.s_cd;
		//find first col. we need to determine the "half" width
		var col_width = Ext.get($qn('.col:first-child', acty_frm)).getWidth();
		
		//default base params
		var o_baseParams = {b_saveResponses:true, s_type_cd:this.s_cd};
		if(this.s_cd != "A")
			Ext.apply(o_baseParams, {s_acty_acty_id:this.s_acty_acty_id,acty_start_dt:'',acty_end_dt:'', 
				s_acty_acty_crtd_id:this.s_acty_acty_crtd_id});
		
		//setup array of form fields
		this.a_flds = [];
		//console.info(this.frm_acty);
		
		//get the column width
		var col_width_full = Ext.get($qn('.colfull:first-child', acty_frm)).getWidth();
		
		//activity name
		var o_nm = {
			xtype:'textfield'
			, allowBlank:false
			, anchor:'98%'
			, msgTarget:'under'
			, applyTo:'acty_nm_' + this.s_cd
		};
		this.a_flds.push(o_nm);
		
		//dates
		if(this.s_cd == 'A') {
			var o_dt = {allowBlank:false, format: 'M j, Y', width:col_width, msgTarget: 'side',
						altFormats:'m/d/y|m/d/Y|n/j/y|n/j/Y|F j, Y|d/m/y|d/m/Y|j/n/y|j/n/Y',
						applyTo:'acty_start_dt', anchor:'50%'}
			var start_dt = new Ext.form.DateField(o_dt);
			// make it so that the end date gets filled once you fill in the start date
			start_dt.on('change'
				,function(){
					if(start_dt.getValue().toString().length){
						var end_dt = this.frm_acty.findField('acty_end_dt');
						if(!end_dt.getValue().toString().length)
							end_dt.setValue(start_dt.getValue());
					}
				}
				,this
			);
			this.a_flds.push(start_dt);
			o_dt.applyTo = 'acty_end_dt';
			o_dt.xtype = 'datefield';
			this.a_flds.push(o_dt);
			
			//highlight
			if(this.b_allow_highlight)
				this.a_flds.push({xtype:'checkbox', applyTo:'acty_hlght_ind'});
		}
		
		//rest of form
		for(var s_id in this.o_form) {
			var item = this.o_form[s_id];
			Ext.applyIf(item, {type:"Field", name:s_id, id:s_id});
			//alert(s_id);
			if(item.width < 0)
				item.width += col_width;
			
			/*
			if(item.type == "ComboBox") {
				this.a_flds.push(
					new Ext.form.ComboBox({
						emptyText:'Please select one...',
						typeAhead: true,
						mode: 'local',
						triggerAction: 'all',
						transform:s_id,
						width:item.width,
						forceSelection:true
					})
				);
			}
			else
			*/
			if(item.ui && item.ui == "slider") {
				var slider;
				Ext.each(this.o_slider[s_id], function(sitem, index) {
					if(index == 0)
						slider = new star.Utils.slider( 'slider_' + sitem.id_real, sitem );
					else
						slider.addSlider('slider_' + sitem.id_real, sitem);
					//console.info(slider.el_input_ext);
					this.a_flds.push(slider.el_input_ext);
				}, this);
			}
			else {
				item.applyTo = s_id;
				item.xtype = item.type.toLowerCase();
				this.a_flds.push(item);
			}
			
			//TODO:find out why the value does not work with selectbox multi - seems to work on people_js
			if(item.value && item.value.length) {
				var frm_item = Ext.getDom(s_id);
				Ext.each(frm_item.options, function(citem) {
					if(item.value.indexOf(citem.value) != -1)
						citem.selected = true;
				});
			}
			
		}
		
		//if there are person roles, then create the person role ui
		if(this.st_prsn_roles && this.st_prsn_roles.a_roles) {
			//message box for person roles
			this.s_msg_roles = '<span class="txtdark">Please select a role for this person: </span><br/>\
								<div class="centered padded"><select id="prsn_role_select">';
			Ext.each(this.st_prsn_roles.a_roles, function(item) {
				this.s_msg_roles += '<option value="' + item.prsn_role_id + '">' + item.prsn_role_desc + '</option>';
			}, this);
			this.s_msg_roles += '</div></select>';
		}
		
		var othis = this;
		//mini buttons (buttons inside the form)
		Ext.each(this.a_btn_mini, function(item) {
			var el = Ext.get(item);
			var id_main = item.substr(String('btn_').length);
			
			
			//file
			if(el.hasClass('btnfile')) {
				//add new file ui
				this.uiAddFile(el, id_main, col_width);
				
				//button
				new Ext.Button({
					renderTo:item
					,text:'Add File'
					,cls: 'btn-no-icon'
					,scope: this
					,handler: function(){
						var index = Ext.getDom('fileall_' + id_main).getAttribute('index');
						var el_id = id_main + '_' + index;
						
						var file = othis.frm_acty.findField(el_id);
						var caption = othis.frm_acty.findField('caption_' + el_id).getValue();
						var highlight = othis.frm_acty.findField('highlight_' + el_id);
						var s_checked = (highlight.el.dom.checked) ? ' checked="checked"' : '';
						var highlight_id = highlight.el.id;
						var highlight_html = '<input type="checkbox" id="' + highlight_id + '" \
								title="Please note only 1 photo may be selected as primary." \
								class="filehighlight" \
								name="' + highlight_id + '"' + s_checked + '"/>';
							
						var file_value = file.getValue();
						
						//caption and filename are required
						if(!Ext.isEmpty(caption) && !Ext.isEmpty(file_value)) {
							var file_real = file_value.split("\\").pop(); //get the file name without the directory
							othis.frm_acty.remove(highlight); //remove from form
							Ext.get(highlight_id).remove();   //remove from dom
							
							var a_fields = [
								{tag:'td', title:file_real, html:file_real},
								{tag:'td', title:caption, html:caption},
								{tag:'td', title:'Check to set photo as primary', html:highlight_html}
							]
							othis.uiGridMini_add(a_fields, 'tabmini_l_keepers_'+this.s_cd, el_id, 
								function() { othis.uiRemoveFile(el_id); }
							);
							othis.uiAddFile(el, id_main, col_width);
							
							//add highlight back to form
							var o_highlight = {xtype:'field', applyTo:highlight_id};
							othis.a_flds.push(o_highlight);
							var fld_highlight = othis.frm_acty_panel.add(o_highlight);
							othis.frm_acty.items.items.push(fld_highlight);
							
							//hide previous file fields
							file.hide();
							Ext.get('extra_' + el_id).addClass('hidden');
						}
						else if(Ext.isEmpty(file_value))
							Ext.MessageBox.alert('Error', 'You must select a file to upload');
						else
							Ext.MessageBox.alert('Error', 'You must enter a caption for this file');
					}
				});
			}
			
			//addon
			else if(el.hasClass('btnaddon')) {
				//menu
				var a_addon_types = [];
				Ext.each(othis.st_addon_types.a_types, function(bitem) {
					a_addon_types.push(
						new Ext.menu.CheckItem({
							text: bitem.s_nm,
							checked: false,
							group: 'addon-group',
							handler: function() {
								var s_rspns_prefix = id_main.split("_")[2] + othis.a_delims[0] + '-' + othis.a_delims[0];
								var o_acty = new star.Activity({
									s_acty_type_id: bitem.s_id, 
									b_new: true, 
									s_cd: 'O',
									s_acty_acty_id: othis.s_id, 
									s_acty_acty_crtd_id: othis.st_acty.acty_crtd_id,
									o_fn: { uiGridMini_add: othis.uiGridMini_add, uiGridMini_remove: othis.uiGridMini_remove },
									s_tab_id: 'tabmini_' + id_main,
									s_rspns_id: id_main,
									s_rspns_prefix: s_rspns_prefix
								});
								o_acty.init();
							}
						})
					);
				});
				a_addon_types.unshift('<span class="menu-title">Please select one</span>');
				//button
				new Ext.Button({
					renderTo:item
					,text:'Add Add-On'
					,cls: 'btn-no-icon'
					,menu: a_addon_types
				});
			}
		}, this);
		
/* 		//create ext form
		var frm_acty = new Ext.form.FormPanel({
			contentEl:acty_frm, 
			baseParams:o_baseParams, 
			//fileUpload:true, 
			layout:'form',
			autoScroll:true,
			items:this.a_flds 
		});
		var tab = this.dlg.getTabs().getActiveTab();
		tab.add(frm_acty);
		tab.doLayout();
		this.frm_acty = frm_acty.getForm();
		console.log(this.frm_acty);
		console.log(this.frm_acty.findField('acty_nm_tmp')); */
		
		/* this.frm_acty = new Ext.form.BasicForm(acty_frm, { baseParams:o_baseParams, fileUpload:false });
		this.frm_acty.add.apply(this.frm_acty,this.a_flds);
		var tab = this.dlg.getTabs().getActiveTab();
		var np = tab.add(new Ext.Panel({
			autoScroll:true
			,contentEl:this.frm_acty.el
		}));
		tab.doLayout();
		console.log(this.frm_acty);
		console.log(np); */
		
		//make people search
		if(this.b_people){
			this.ui_peopleSearch(col_width);
			this.a_flds.push({xtype:'textfield', applyTo:'ppl_search', anchor:'55%'})
		}
		//make media search
		if(this.b_media){
			this.ui_mediaSearch(col_width);
			this.a_flds.push({xtype:'textfield', applyTo:'media_search', anchor:'55%'})
		}
		
		// push the existing markup of the tab on the list of children as the first child, this prevents the 
		// code from pushing the html down when we add the form panel to the tab
		this.a_flds.unshift({contentEl:acty_frm});
		//create ext form
		var frm_acty = new Ext.form.FormPanel({
			//contentEl:acty_frm, 
			//id:acty_frm,
			//cls:'dlg_frm',
			baseParams:o_baseParams, 
			fileUpload:true, 
			layout:'form',
			autoScroll:true,
			items:this.a_flds
		});
		
		this.frm_acty_panel = frm_acty;
		
		/* // add the fields to the form panel
		Ext.each(this.a_flds,function(item){
			frm_acty.add(item);
		}); */
		// add the formpanel to the tab
		var tab = this.dlg.getTabs().getActiveTab();
		tab.add(frm_acty);
		tab.doLayout();
		this.frm_acty = frm_acty.getForm();

		//attach events to highlight file checkboxes
		Ext.get(acty_frm).on("click", function(e, o) {
			//make sure only 1 file highlight is checked
			if(o.checked) {
				Ext.each(Ext.DomQuery.select('input.filehighlight', acty_frm), function(item) {
					if(item != o)
						item.checked = false;
				});
			}
		},  this, {delegate: "input.filehighlight"});
		
		//attach events to remove buttons
		Ext.get(acty_frm).on("click", function(e, o) {
			 e.stopEvent();
			this.uiGridMini_remove(o);
		},  this, {delegate: "a.ico_remove"});
		
		//attach events to people links
		Ext.get(acty_frm).on("click", function(e, o) {
			 e.stopEvent();
			this.editPerson(o);
		},  this, {delegate: "a.editprsn"});
		
		//attach events to addon buttons
		Ext.get(acty_frm).on("click", function(e, o) {
			 e.stopEvent();
			this.selectAddon(o);
		},  this, {delegate: "a.addonlink"});
		
		//decode values
		if(this.s_edit_values) {
			var o_edit_values = Ext.urlDecode(this.s_edit_values);
			this.frm_acty.setValues(o_edit_values);
		}
	}
	
	,editPerson: function(el) {
		var parent_tr = Ext.get(el).findParentNode('tr');
		var value = $qn('a.ico_remove', parent_tr).getAttribute('value');
		var a_value = value.split("_");
		var prsn = new star.People(parent_tr);
		prsn.viewPerson(a_value[0], parent_tr, {i_width:this.dlg.getSize().width-50, i_height:this.dlg.getSize().height-50});
	}
	
	,editQnA: function() {
		/* if(!Ext.isIE)
			console.info(this); */
		//create form to house the fields
		this.o_form = {};
		//sliders
		this.o_slider = {};
		//mini buttons storage
		this.a_btn_mini = [];
		
		this.o_requiredFields = {};
		
		//console.info(this);
		//loop through questions
		this.o_template_data.question = [];
		for(var i=0; i<this.a_qstns.length; i++) {
			var o_qstn = this.a_qstns[i];
			o_qstn.s_name = 'rspn_' + o_qstn.s_ui + '_' + o_qstn.s_id + '_' + o_qstn.s_qstn_id + '_' + o_qstn.s_datatype;
			o_qstn.s_instr = (o_qstn.s_instr == "") ? "&nbsp;" : o_qstn.s_instr;
			var a_rspns = (o_qstn.a_rspns_changed) ? o_qstn.a_rspns_changed : o_qstn.a_rspns;
			var s_input = this.editQnAInput(o_qstn, i, a_rspns);
			var s_question = o_qstn.b_required ? '<em class="req">' + o_qstn.s_question + '</em>' : o_qstn.s_question;
			
			if(o_qstn.s_ui == "slidernum" || o_qstn.s_ui == "sliderpercent") {
				this.o_template_data.question.push({
					s_question: s_question,
					o_label: {
						s_name: o_qstn.s_name,
						s_instr: o_qstn.s_instr,
						s_input: s_input[1],
						s_label: s_input[0],
						b_fullLabel: true
					}
				});
			}
			else {
				this.o_template_data.question.push({
					s_question: s_question,
					o_label: {
						s_name: o_qstn.s_name,
						s_instr: o_qstn.s_instr,
						s_input: s_input,
						b_fullLabel: false
					}
				});
			}
		}
	}
	
	//determines what ui to show
	,editQnAInput: function(o_qstn, index, a_rspns) {
		var s_input = '';
		if(o_qstn.s_list)
			o_qstn.s_list = o_qstn.s_list.toLowerCase();
		//store "real" s_name
		o_qstn.s_name_real = o_qstn.s_name;
		//replace s_name with html code equivalent so it can "fit" in value fields
		o_qstn.s_name = this.curlyReplace(o_qstn.s_name);
		
		//get required fields
		//if required then create required fields object to house the required field
		if(o_qstn.b_required) {
			if(!this.o_requiredFields)
				this.o_requiredFields = {};
			var s_name = o_qstn.s_name_real;
			if(!this.o_requiredFields[s_name]) {
				this.o_requiredFields[s_name] = {};
				this.o_requiredFields[s_name].title = o_qstn.s_question;
				this.o_requiredFields[s_name].value = '';
				if(o_qstn.s_ui == 'slidernum' || o_qstn.s_ui == 'sliderpercent') {
					this.o_requiredFields[s_name] = false;
					//o_qstn.b_required = false;
				}
				if(o_qstn.s_ui == "textbox" && o_qstn.s_datatype == "numeric")
					this.o_requiredFields[s_name].b_checkinput = true;
			}
		}
		
		/*
		if(o_qstn.b_required) {
			if(!this.a_requiredFields)
				this.a_requiredFields = [];
			if(o_qstn.s_ui == "fileupload" || o_qstn.s_ui == "fileuploadmulti")
				this.a_requiredFields.push("l_keepers");
			else if(o_qstn.s_ui == "slidernum" || o_qstn.s_ui == "sliderpercent")
				this.a_requiredFields.push([]); //add an array - this will house all the ids for the that slider
			else
				this.a_requiredFields.push(o_qstn.s_name_real);
		}*/
		
		var anch_per = '55%'; // default percentage to anchor fields
		
		switch(o_qstn.s_ui) {
			case "slidernum":
				var o_type = {type:'num'};
				if(!this.a_slider_nums)
					this.a_slider_nums = [];
			case "sliderpercent":
				if(!this.o_slider[o_qstn.s_name_real])
					this.o_slider[o_qstn.s_name_real] = [];
				if(!o_type) {
					if(!this.a_slider_percents)
						this.a_slider_percents = [];
					if(!this.o_slider_id)
						this.o_slider_id = {};
					var o_type = {type:'percent', total:100, b_start:true};
				}
				var a_list = this.st_pssbl_rspns.st_lists[o_qstn.s_list];
				this.o_form[o_qstn.s_name_real] = {type:"NumberField", width:"40", ui:"slider"};
				s_input = ["",""]; //note: s_input has been converted to an array to store the slider's labels and input
				var a_ids = []; //ids to keep for slider percents
				
				var a_rspns_ids = [], a_vals = [];
				if(a_rspns)
					Ext.each(a_rspns,function(item){
						if(item && item.pssbl_rspns_id)
							a_rspns_ids.push(item.pssbl_rspns_id);
							a_vals.push(item.val);
					}, this);
				
				Ext.each(a_list, function(item, index) {
					var value = 0;
					if(a_rspns){
						var i_pos = a_rspns_ids.indexOf(item.pssbl_rspns_id);
						value = (i_pos == -1) ? 0 : a_vals[i_pos];
						if(item.pssbl_rspns_actv_ind == 'N' && value == 0)
							return;
					} else if(item.pssbl_rspns_actv_ind == 'N') // for new records skip the inactive items
						return;
						
					var cindex = index + 1;
					var s_id = o_qstn.s_name + '_' + this.curlyReplace(item.pssbl_rspns_id).toUpperCase() + '_' + cindex;
					var s_id_real = o_qstn.s_name_real + '_' + item.pssbl_rspns_id + '_' + cindex;
					//var value = o_qstn.a_rspns && o_qstn.a_rspns[index] ? o_qstn.a_rspns[index].val : 0;
					s_input[0] += '<div style="height:31px" title="' + item.pssbl_rspns_instrctn_txt + '">' + item.pssbl_rspns_rspns_txt + '</div>';
					s_input[1] += '<div id="slider_' + s_id + '"></div>';
					var o_type_each = {id:s_id, id_real:s_id_real, start:value, type:'percent'};
					if(index == 0) {
						Ext.apply(o_type, o_type_each);
						this.o_slider[o_qstn.s_name_real].push(o_type);
					}
					else
						this.o_slider[o_qstn.s_name_real].push(o_type_each);
					
					//if(o_qstn.b_required)
						//this.a_requiredFields[this.a_requiredFields.length-1].push(s_id_real);
						
					if(o_type.type == 'percent')
						a_ids.push(s_id_real);
					// the list structure containing the array of possible responses for this question
					
					// position in the above list of the currently selected possible response
					//var i_rspn = this.st_pssbl_rspns.st_rspns[item.pssbl_rspns_id.toLowerCase()];
				}, this);
				
				if(o_type.type == 'percent') {
					this.a_slider_percents.push(a_ids);
					if(o_qstn.b_required) {
						this.o_slider_id[this.a_slider_percents.length-1] = true;
					}
				}
				break;
			case "fileupload":
			case "fileuploadmulti":
				this.o_form["l_keepers"] = {type:"Field"};
				this.a_btn_mini.push('btn_' + o_qstn.s_name_real);
				var a_fields = [];
				var a_values = [];
				var index = 1;
				var temp_name = o_qstn.s_name; //temp name because s_name changes with index added to it below
				if(a_rspns) {
					Ext.each(a_rspns, function(item) {
						index++;
						var s_checked = (item.b_highlight == 1) ? ' checked="checked"' : '';
						a_fields.push([
							item.s_file,
							item.s_caption,
							'<input type="checkbox" id="highlight_' + item.s_id + '" \
								title="Please note only 1 photo may be selected for the highlight report." \
								class="filehighlight" \
								name="highlight_' + item.s_id + '"' + s_checked + '/>'
						]);
						a_values.push(item.s_id);
					}, this);
				}
				o_qstn.s_name += '_' + index;
				o_qstn.s_name_real += '_' + index;
				
				s_input = '\
					<div id="fileall_' + temp_name + '" class="filecontainer" index="' + (index-1) + '">\
						<i class="i">Upload file</i><br/>\
					</div>\
					<div style="margin-top:5px" id="btn_' + temp_name + '" class="btnfile"></div>';
					
					
				//this.o_form[o_qstn.s_name_real] = {type:"Field"};
				this.o_form['l_keepers'] = {type:"Field"};
				//this.o_form['caption_' + o_qstn.s_name_real] = {type:"Field", width:-10};
				//this.o_form['highlight_' + o_qstn.s_name_real] = {type:"Checkbox", 
					//boxLabel:'<i class="i">Check to include in Highlight Report</i>'};
				s_input += this.uiGridMini({
					tab_nm:'l_keepers_'+this.s_cd,
					a_headers:['File', 'Caption', {name:'Primary', width:40}], 
					a_fields: a_fields, 
					o_hidden: {name:'l_keepers', value:a_values.join(",")},
					a_values: a_values
				});
				break;
			case "addon":
				//a_rspns = o_qstn.a_rspns; //force addon to have the real a_rspns NOT the a_rspns_changed 
				this.o_form[o_qstn.s_name_real] = {type:"Field", width:-40};
				this.a_btn_mini.push('btn_' + o_qstn.s_name_real);
				var a_fields = [];
				var a_values = [];
				if(a_rspns) {
					Ext.each(a_rspns, function(item) {
						var addon_type_id = item.addon_type_id.toLowerCase();
						a_fields.push([
							'<a href="#" class="addonlink">' + item.val_nm + '</a>',
							'<span value="' + this.curlyReplace(item.addon_type_id) + '">' 
								+ this.st_addon_types.a_types[(this.st_addon_types.st_types[addon_type_id]-1)].s_nm
							+ '</span>'
						]);
						a_values.push(this.curlyReplace(o_qstn.s_id) + this.a_delims[0] + this.curlyReplace(item.s_id));
					}, this);
				}
				s_input = '<div id="btn_' + o_qstn.s_name + '" class="btnaddon"></div>';
				s_input += this.uiGridMini({
					a_headers:['Name', 'Type'], 
					a_fields: a_fields, 
					o_hidden: { name:o_qstn.s_name, value:a_values.join(this.a_delims[1]) },
					a_values: a_values,
					s_delim: this.a_delims[1]
				});
				break;
			case "people":
				this.o_form[o_qstn.s_name_real] = {type:"Field"};
				this.b_people = true;
				/*
				this.a_btn_mini.push({
					id:'btn_' + o_qstn.s_name, 
					cls:'btn-force', 
					handler: function() { this.ui_peopleSearch('ppl_search'); }, 
					text:'Search', 
					tooltip:'Click to Search People'
				});*/
				var a_fields = [];
				var a_values = [];
				if(a_rspns) {
					Ext.each(a_rspns, function(item) {
						var prsn_id = item.prsn_id.toLowerCase();
						var role_id = item.role_id.toLowerCase();
						a_fields.push([
							'<a href="#" class="editprsn">' + this.st_prsns[prsn_id].prsn_last_nm + '</a>',
							'<a href="#" class="editprsn">' + this.st_prsns[prsn_id].prsn_frst_nm + '</a>',
							this.st_prsn_roles.a_roles[(this.st_prsn_roles.st_roles[role_id]-1)].prsn_role_desc
						]);
						
						a_values.push(item.prsn_id + '_' + item.role_id);
					}, this);
				}
				s_input = '\
					<div class="x-form-element fleft nopadding">\
						<input type="text" id="ppl_search" name="ppl_search" \
							title="Enter keywords to search people" />\
					</div>\
					<div class="brclear"></div>';
				s_input += this.uiGridMini({
					a_headers: ['Last Name', 'First Name', 'Role'],
					a_fields: a_fields,
					o_hidden: {name:o_qstn.s_name, value:a_values.join(",")},
					a_values: a_values
				});
				s_input += '<br/><div id="ppl_new"></div>';
				break;
			case "media":
				this.o_form[o_qstn.s_name_real] = {type:"Field"};
				this.b_media = true;
				var a_fields = [];
				var a_values = [];
				if(this.st_media && a_rspns) {
					Ext.each(a_rspns, function(item, index) {
						if(this.st_media[item.pssbl_rspns_id.toLowerCase()]) {
							var s_rspns_txt = this.st_media[item.pssbl_rspns_id.toLowerCase()];
							a_fields.push([s_rspns_txt]);
							a_values.push(this.curlyReplace(item.pssbl_rspns_id) + "_" + (index+1) + "_" + this.commaReplace(s_rspns_txt));
						}
					}, this);
					/*
					for(var j=0; j<this.st_pssbl_rspns.st_lists[o_qstn.s_list].length; j++) {
						var o_rspns = this.st_pssbl_rspns.st_lists[o_qstn.s_list][j];
						var s_rspns_txt = o_rspns.pssbl_rspns_rspns_txt;
						var s_rspns_value = this.curlyReplace(o_rspns.pssbl_rspns_id) + "_" + (j+1) + "_" + this.commaReplace(s_rspns_txt);
						var s_rspns_value_real = o_rspns.pssbl_rspns_id + "_" + (j+1) + "_" + this.commaReplace(s_rspns_txt);
						
						a_fields.push([s_rspns_text]);
						a_values.push(s_rspns_value);
					}*/
				}
				s_input = '\
					<div class="x-form-element fleft nopadding">\
						<input type="text" id="media_search" name="media_search" s_qstn_id="' + this.curlyReplace(o_qstn.s_qstn_id) + '" \
							title="Enter keywords to search media" />\
					</div>\
					<div class="brclear"></div>';
				s_input += this.uiGridMini({
					a_headers: ['Media'],
					a_fields: a_fields,
					o_hidden: {name:o_qstn.s_name, value:a_values.join(",")},
					a_values: a_values
				});
				break;
			case "city":
				this.o_form[o_qstn.s_name_real] = {type:"Field", value:[], anchor:anch_per};
				s_input = '<i class="i">Select all that apply. Hold down the "Ctrl" key to select multiple entries</i><br/>'
						+'<select name="' + o_qstn.s_name + '" id="' + o_qstn.s_name + '" multiple="multiple">'
							+ '<option value="">-- Please select one --</option>';
				//if value has been selected, place in form value field. (Ext selectboxes do not convert well when there is more than 1 value selected so this is necessary to force in the value field)
				for(var j=0; j<this.st_city.a_cities.length; j++) {
					var s_checked = "";
					var o_rspns = this.st_city.a_cities[j];
					var s_rspns_txt = o_rspns.city_nm;
					var s_rspns_value = this.curlyReplace(o_rspns.city_id) + "_" + (j+1) + "_" + this.commaReplace(s_rspns_txt);
					var s_rspns_value_real = o_rspns.city_id + "_" + (j+1) + "_" + this.commaReplace(s_rspns_txt);
					if(a_rspns) {
						Ext.each(a_rspns, function(item) {
							if(item && item.city_id == o_rspns.city_id) {
								this.o_form[o_qstn.s_name_real].value.push(s_rspns_value_real);
								s_checked = ' selected="true"';
								a_rspns.remove(item);
							}
						}, this);
					}
					s_input += '<option value="' + s_rspns_value + '"' + s_checked + '>' + s_rspns_txt + '</option>';
				}
				s_input += '</select>';
				break;
			case "mediamatrix":
				this.o_form[o_qstn.s_name_real] = {type:"Field", value:[], anchor:anch_per};
				s_input = '<i class="i">Select all that apply. Hold down the "Ctrl" key to select multiple entries</i><br/>'
						+'<select name="' + o_qstn.s_name + '" id="' + o_qstn.s_name + '" multiple="multiple">'
							+ '<option value="">-- Please select one --</option>';
				//if value has been selected, place in form value field. (Ext selectboxes do not convert well when there is more than 1 value selected so this is necessary to force in the value field)
				for(var j=0; j<this.st_mediamatrix.a_media.length; j++) {
					var s_checked = "";
					var o_rspns = this.st_mediamatrix.a_media[j];
					var s_rspns_txt = o_rspns.mediamatrix_nm;
					var s_rspns_value = this.curlyReplace(o_rspns.mediamatrix_id) + "_" + (j+1) + "_" + this.commaReplace(s_rspns_txt);
					var s_rspns_value_real = o_rspns.mediamatrix_id + "_" + (j+1) + "_" + this.commaReplace(s_rspns_txt);
					if(a_rspns) {
						Ext.each(a_rspns, function(item) {
							if(item && item.mediamatrix_id == o_rspns.mediamatrix_id) {
								this.o_form[o_qstn.s_name_real].value.push(s_rspns_value_real);
								s_checked = ' selected="true"';
								a_rspns.remove(item);
							}
						}, this);
					}
					s_input += '<option value="' + s_rspns_value + '"' + s_checked + '>' + s_rspns_txt + '</option>';
				}
				s_input += '</select>';
				break;
			case "pps":
				this.o_form[o_qstn.s_name_real] = {type:"Field", value:[], anchor:anch_per};
				s_input = '<i class="i">Select all that apply. Hold down the "Ctrl" key to select multiple entries</i><br/>'
						+'<select name="' + o_qstn.s_name + '" id="' + o_qstn.s_name + '" multiple="multiple">'
							+ '<option value="">-- Please select one --</option>';
				//if value has been selected, place in form value field. (Ext selectboxes do not convert well when there is more than 1 value selected so this is necessary to force in the value field)
				for(var j=0; j<this.st_pps.a_pps.length; j++) {
					var s_checked = "";
					var o_rspns = this.st_pps.a_pps[j];
					var s_rspns_txt = o_rspns.pps_nm;
					var s_rspns_value = this.curlyReplace(o_rspns.pps_id) + "_" + (j+1) + "_" + this.commaReplace(s_rspns_txt);
					var s_rspns_value_real = o_rspns.pps_id + "_" + (j+1) + "_" + this.commaReplace(s_rspns_txt);
					if(a_rspns) {
						Ext.each(a_rspns, function(item) {
							if(item && item.pps_id == o_rspns.pps_id) {
								this.o_form[o_qstn.s_name_real].value.push(s_rspns_value_real);
								s_checked = ' selected="true"';
								a_rspns.remove(item);
							}
						}, this);
					}
					s_input += '<option value="' + s_rspns_value + '"' + s_checked + '>' + s_rspns_txt + '</option>';
				}
				s_input += '</select>';
				break;
			case "selectboxmulti":
				s_input = '<i class="i">Select all that apply. Hold down the "Ctrl" key to select multiple entries</i><br/>'
					+ '<select name="' + o_qstn.s_name + '" id="' + o_qstn.s_name + '"  multiple="multiple">';
			case "selectbox":
				this.o_form[o_qstn.s_name_real] = {type:"Field", value:[], anchor:anch_per};
				if(s_input == "") {
					//this.o_form[o_qstn.s_name_real] = {type:"ComboBox", value:[]};
					s_input = '<select name="' + o_qstn.s_name + '" id="' + o_qstn.s_name + '">'
						+ '<option value="">-- Please select one --</option>';
				}
				if(this.st_pssbl_rspns.st_lists[o_qstn.s_list]) {
					for(var j=0; j<this.st_pssbl_rspns.st_lists[o_qstn.s_list].length; j++) {
						var s_checked = "";
						var o_rspns = this.st_pssbl_rspns.st_lists[o_qstn.s_list][j];
						var s_rspns_txt = o_rspns.pssbl_rspns_rspns_txt;
						var s_rspns_value = this.curlyReplace(o_rspns.pssbl_rspns_id) + "_" + (j+1) + "_" + this.commaReplace(s_rspns_txt);
						var s_rspns_value_real = o_rspns.pssbl_rspns_id + "_" + (j+1) + "_" + this.commaReplace(s_rspns_txt);
						if(a_rspns) {
							Ext.each(a_rspns, function(item) {
								if(item && item.pssbl_rspns_id == o_rspns.pssbl_rspns_id) {
									this.o_form[o_qstn.s_name_real].value.push(s_rspns_value_real);
									s_checked = ' selected="true"';
									a_rspns.remove(item);
								}
							}, this);
						}
						s_input += '<option value="' + s_rspns_value + '" title="' + o_rspns.pssbl_rspns_instrctn_txt + '"' + s_checked + '>' + s_rspns_txt + '</option>';
					}
				}
				s_input += '</select>';
				break;
			case "textarea":
				this.o_form[o_qstn.s_name_real] = {type:"TextArea", height:100, anchor:anch_per};
				s_input = '<textarea name="' + o_qstn.s_name + '" id="' + o_qstn.s_name + '" title="' + o_qstn.s_instr + '">';
				if(a_rspns && a_rspns.length) s_input += a_rspns[0].val;
				s_input += '</textarea>';
				break;
			case "textbox":
				if(o_qstn.s_datatype == "numeric") {
					this.o_form[o_qstn.s_name_real] = {type:"NumberField", width:"50"};
					if(!Ext.isEmpty(o_qstn.i_max))
						this.o_form[o_qstn.s_name_real].maxValue = o_qstn.i_max;
						this.o_form[o_qstn.s_name_real].minValue = o_qstn.i_min;
				}
				else
					this.o_form[o_qstn.s_name_real] = {type:"TextField", anchor:anch_per};
				s_input = '<input type="text" name="' + o_qstn.s_name + '" id="' + o_qstn.s_name + '" '
							+ 'title="' + o_qstn.s_instr + '" value="';
				if(a_rspns && a_rspns.length) s_input += a_rspns[0].val;
				s_input += '" />';
				break;
		}
		return s_input;
	}
	
	,init: function(anim_el){
		this.buildDialog(anim_el, this);
		this.load();
	}

	,load: function(){
		//var tab_acty = this.dlg.o_panels[this.start_panel];
		//var umgr = tab_acty.bodyPanel.getEl().getUpdateManager();
		var tabs = this.dlg.getTabs();
		var umgr = tabs.getItem(this.start_tab).body.getUpdateManager();
		var s_url;
		if(this.b_new && this.s_acty_type_id) 
			s_url = star.Utils.buildUrl('component','activities','newActivity')
							+ '&s_acty_type_id=' + this.s_acty_type_id
							+ '&s_cd=' + this.s_cd;
		else
			s_url = star.Utils.buildUrl('component','activities','viewActivity')
							+ '&s_actyID=' + this.s_id
							+ '&s_cd=' + this.s_cd;
		
		umgr.setRenderer(
			{
				render: function(el,response){
					if(this.scope.dlg){ // make sure the dialog is still up before updating it
						var o_data = Ext.decode(response.responseText);
						if(o_data.st_data.s_status && o_data.st_data.s_status != 'success') {
							el.update(o_data.st_data.s_status);
							return;
						}
						// let's keep track of old rspns to clone if necessary
						if(this.scope.b_clone) {
							var st_clone = {};
							Ext.each(this.scope.a_qstns,function(item){
								if(item.b_clone)
									st_clone[item.s_qstn_id] = item.a_rspns;
							},this);
							
						}
						
						//console.info(o_data.st_data);
						// place the data returned into the activity object (this.scope refers to the activity object)
						Ext.apply(this.scope,o_data.st_data);
						console.log(o_data.st_data);
						// now add cloned rspns
						if(st_clone) {
							// get rid of name, date, etc. changes if any
							if(this.scope.st_acty_changes)
								delete this.scope.st_acty_changes;
							Ext.each(this.scope.a_qstns,function(item) {
								if(st_clone[item.s_qstn_id]) {
									item.a_rspns = st_clone[item.s_qstn_id];
								}
							});
						}
												
						if(!this.scope.b_new) {
							
							if(this.scope.st_result_types && this.scope.st_result_types.a_types.length > 0 && this.scope.s_cd == 'A') {
								//create results panel
								var tab_result = this.scope.dlg.addTab({s_name:'tab_result', s_title:'Results'}, tabs);
								//when result is activated for the first time, showResults()
								tab_result.on('activate', this.scope.showResults, this.scope, {single:true});
							}
							this.scope.view(el); // view activity
						}
						else
							this.scope.create(el); //new activity
					}
				}
				, scope: this
			}
		);
		
		var s_txt = ' Retrieving ' + this.s_type_name + ' ...';
		if(this.b_new)
			if(this.b_clone)
				s_txt = ' Cloning ' + this.s_type_name + ' ...';
			else
				s_txt = ' Creating ' + this.s_type_name + ' ...';
		umgr.update({
			url: s_url
			,scripts: false
			,text: s_txt
		});
		// make sure if the dialog is closed that the request is canceled
		this.dlg.on('beforehide'
			,function(){
				if(umgr.transaction){
					umgr.abort();
				}
			}
			,this
			,{single:true}
		);
		
		/*tab_acty.getEl().update(star.img_anim + ' loading activity ...');
		$conn.request({
			params: {
				s_resourceType: 'component'
				,s_resource: 'activities'
				,s_method: 'viewActivity'
				,s_actyID: rec.id
				,rnd: new Date().getTime()
			}
			,callback: function(options,b_success,response){
				if(b_success) {
					var o_data = Ext.decode(response.responseText);
					if(typeof console != 'undefined')
						console.info(o_data);
				}
			}
		});*/
	}
	
	,notifyActivity: function(s_to, s_msg) {
		
		//hide menu
		this.menu_notify.hide(true);
		
		//if form is defined (that is when editing or creating...), save and send through form
		if(Ext.get('acty_frm_' + this.s_cd)) {
			if(!Ext.isEmpty(s_to)) {
				//add new hidden fields to form
				$dh.append('acty_frm_' + this.s_cd, {tag:'input', name:'notifyTo', id:'notifyTo', value:s_to, type:'hidden'});
				$dh.append('acty_frm_' + this.s_cd, {tag:'input', name:'notifyMsg', id:'notifyMsg', value:s_msg, type:'hidden'});
				this.a_flds.push({xtype:'field', applyTo:'notifyTo'});
				this.a_flds.push({xtype:'field', applyTo:'notifyMsg'});
			}
			this.save(true, false, 'approve');
		}
		//otherwise just save and send with the non form values
		else {
			this.s_required = this.checkRequired();
			var b_dates = this.checkDates(true, this.st_acty.acty_start_dt, this.st_acty.acty_end_dt);
			
			if(this.s_required)
				Ext.MessageBox.alert('Error', this.s_required);
			else if(!b_dates)
				Ext.MessageBox.alert('Error', this.s_msg_date);
			else {
				Ext.MessageBox.confirm('Confirm', this.s_approve_msg, function(s_btn) {
					if(s_btn == "yes") {
						$conn.request({
							params: {	
								s_resourceType: 'component'
								,s_resource: 'activities'
								,s_method: 'saveActivity'
								,acty_id: this.st_acty.acty_id
								,b_saveResponses: false
								,s_status: 'approve'
								,acty_nm_a: this.st_acty.acty_nm
								,acty_type_id: this.acty_type_id
								,acty_start_dt: this.st_acty.acty_start_dt
								,acty_end_dt: this.st_acty.acty_end_dt
								,acty_type_nm: this.acty_type_nm
								,s_taskID: this.s_task_id
								,notifyTo: s_to
								,notifyMsg: s_msg
								,rnd: new Date().getTime()
							},
							callback: function(options,b_success,response) {
								if(b_success) {
									var o_response = Ext.decode(response.responseText);
									var o_data =  o_response.st_data;
									if(o_data.s_status != "error") {
										star.MyTasks.updateCount(o_data.i_tasks);
										this.dlg.hide();
										Ext.MessageBox.alert('Status', 'This activity has been successfully approved');
										$sect.sections[$sect.s_curr_sect].reloadGrid(true);
									}
									else
										Ext.MessageBox.alert('Error', 'This activity could not be approved');
								}
							},
							failure: function() {
								Ext.MessageBox.alert('Error', 'This activity could not be approved');
							},
							scope: this
						});
					}
				}, this);
			}
		}
	}
	
	,notifyUsersMenu: function() {
		// if the menu already exists then simply return it
		if(this.menu_notify)
			return this.menu_notify;
		
		var s_reviewers = '<select id="selectNotifiers" multiple>';
		
		Ext.each(["involved","others"], function(iitem, iindex) {
			Ext.each(this.st_notify["q_"+iitem].data.USR_ID, function(aitem, aindex) {
				var citem = this.st_notify["q_"+iitem].data;
				var s_nm = citem.PRSN_FRST_NM[aindex] + ' ' + citem.PRSN_LAST_NM[aindex];
				var s_value = citem.USR_ID[aindex] + '|' + citem.PRSN_FRST_NM[aindex] + '|' + citem.PRSN_LAST_NM[aindex];
				s_value += '|' + citem.EMAIL_ADRS_TXT[aindex];
				var cls = (iitem == "involved") ? ' class="opt_approve"' : '';
				s_reviewers += '<option' + cls + ' value="' + s_value + '">' + s_nm + '</option>';
			}, this);
		}, this);
		
		s_reviewers += '</select>';
		
		var sub_menu = new Ext.menu.Menu({
			id:'notifyMenu',
			hideOnClick: false,
			subMenuAlign: 'c-c',
			cls:'msg_review_body',
			items: [ '<div id="notifyMenu"><div class="menu-title-dark">'
						+ 'You may choose people to notify that this <br/>'
						+ 'activity has been approved. Users listed in<br/>'
						+ 'bold at the top are those who were involved <br/>'
						+ 'this round in changing this activity:'
				+ '</div>'
				+ '<div class="bold">Hold down CTRL to select multiple:</div>' 
				+ s_reviewers
				+ '<div class="bold">Message to add:</div>'
				+ '<textarea id="msgNotifiers" rows="5"></textarea>'
				+ '<div id="btn_sendnotifiers"></div></div>'
			]
		});
		
		sub_menu.on('show',function(sb){
			//$ev.onAvailable('btn_sendnotifiers',function(){
				//var btn_id = 'btn_' + this.aitem;
				new Ext.Button({
					renderTo:'btn_sendnotifiers',
					cls: 'btn-no-icon',
					text: 'Approve activity',
					//tooltip: 'Approve this activity',
					scope: this,
					handler: function() {
						var a_notifiers = [];
						var el_notifiers = Ext.getDom('selectNotifiers');
						Ext.each(el_notifiers.options, function(item) {
							if(item.selected)
								a_notifiers.push(item.value);
						});
						//if(a_notifiers.length)
						this.notifyActivity(a_notifiers.join(","), Ext.getDom('msgNotifiers').value);
					}
				});
				var msgNotifiers = Ext.get('msgNotifiers');
				//add key listener for 'enter' for textarea, since menu 'cancels' it...
				msgNotifiers.addKeyListener(13, function() {
					this.dom.value += '\n\r';
				}, msgNotifiers);
				//cmbReviewers.applyTo('comboReviewers');
				//sb.btn_rendered = true;
				// hide this menu whenever the dialog is hidden
				this.dlg.on('hide',function(){
					sub_menu.removeAll();
					sub_menu.getEl().remove();
				},this, {single:true});
			//},this,true);
		}, this, {single:true});
		
		return sub_menu;
	}
	
	//save activity
	,save: function(b_approve, s_msg, s_status){
		var s_msg_title = s_status != 'review' ? 'Saving ' + this.s_type_name + '...' : "Sending for review...";
		var s_msg_save = s_msg ? s_msg : "";
		if(b_approve)
			s_msg_save = this.s_approve_msg;
		else if(this.s_cd != "A")
			s_msg_save = "Click Yes to Save";
		
		var s_url = star.Utils.buildUrl('component','activities','saveActivity');
		if(s_status)
			s_url += '&s_status=' + s_status;
		if(this.s_acty_acty_nm)
			s_url += '&s_acty_acty_nm=' + this.s_acty_acty_nm;
		
		/*
		if(Ext.get('acty_hlght_ind')) {
			if(!$qn('.filehighlight:checked')) {
				Ext.MessageBox.alert('Error', 'If this activity is highlighted, there should be at least 1 file highlighted');
				return;
			}
		}*/
		
		this.s_required = this.checkRequired();
		
		//if(this.validateSliderPercent()) {
			if((b_approve || this.s_task_status == 'draftExisting') && this.s_required)
				Ext.MessageBox.alert('Error', this.s_required);
			//else if(!this.s_valid)
				//Ext.MessageBox.alert('Error','The sliders should add up to 100% in order to save');
			else if(this.frm_acty.isValid()) {
				var b_dates = (this.s_cd != "A") || this.checkDates(b_approve, Ext.getDom('acty_start_dt').value, Ext.getDom('acty_end_dt').value);
				if(!b_dates) {
					Ext.MessageBox.alert('Error', this.s_msg_date);
				}
				else if(s_msg_save) {
					Ext.MessageBox.minWidth = 400;
					Ext.MessageBox.confirm('Confirm', s_msg_save, function(s_btn) {
						if(s_btn == "yes") {
							var btn_save = 'btn_save';
							if(this.s_cd != "A")
								btn_save += '_other';
							/* Ext.MessageBox.show({
								title: 'Please wait...',
								msg: s_msg_title,
								width:240,
								progress:true,
								closable:false
								//animEl: btn_save
							}); */
							Ext.MessageBox.wait(s_msg_title,'Please wait...');
							
							this.frm_acty.submit({
								success: function(f, a) {
									if(a.result.s_status == "success" && a.result.st_data.s_status != "error") {
										Ext.MessageBox.updateProgress(1);
										this.dlg.hide();
										//reload results grid
										if(this.s_cd == 'R' && this.grid_ds) {
											var st_results = this.o_results;
											//if adding a result
											if(this.b_new) {
												st_results.a_results.push({
													acty_nm: a.result.st_data.acty_nm, 
													acty_type_nm: a.result.st_data.acty_type_nm, 
													acty_hlght_ind: 'N', 
													acty_rslt_rslt_id: a.result.st_data.acty_id
												});
											}
											//if editing...
											else {
												st_results.a_results[this.i_grid_row] = {
													acty_nm: a.result.st_data.acty_nm, 
													acty_type_nm: a.result.st_data.acty_type_nm,
													acty_hlght_ind: st_results.a_results[this.i_grid_row].acty_hlght_ind,
													acty_rslt_rslt_id: st_results.a_results[this.i_grid_row].acty_rslt_rslt_id
												};
											}
											this.grid_ds.proxy = new Ext.data.MemoryProxy(st_results);
											this.grid_ds.reload();
										}
										
										//if only an activity
										if(this.s_cd == 'A') {
											// update the my task number if necessary
											if(a.result.st_data.b_updatenumtasks)
												star.MyTasks.updateCount(a.result.st_data.i_tasks);
											// just in case we changed the activity name or something
											else
												star.MyTasks.reloadGrid();
											//reload main grid on section page
											$sect.sections[$sect.s_curr_sect].reloadGrid(true);
										}
										Ext.MessageBox.alert('Saved',this.s_type_name + ' was saved successfully!');
									}
									else
										Ext.MessageBox.alert(
											'Error'
											,'There was an error saving this ' + this.s_type_name
											+':<br />' + a.result.st_data.s_error
										);
								},
								failure: function(f, a) {
									Ext.MessageBox.alert('Error', 'There was an error saving this ' + this.s_type_name);
								},
								url: s_url,
								scope:this
							});
						}
					}, this);
				}
			}
			else
				Ext.MessageBox.alert('Error', 'Please check that you have filled in all required fields');
		//}
	}
	
	//save addon
	,saveAddon: function() {
		if(this.frm_acty.isValid()) {
			//console.info(this);
			
			var s_rspns_values = Ext.Ajax.serializeForm(this.frm_acty.id);
			//s_rspns_values = s_rspns_values.replace(new RegExp('acty_id=&', "g"), '');
			var s_name = this.frm_acty.findField('acty_nm_' + this.s_cd).getValue();
			//var s_name = document.forms[this.frm_acty.id].acty_nm.value;
			var s_type = this.acty_type_nm;
			var s_rspns_values_real = s_rspns_values;
			
			//if editing...
			if(this.i_row_index) {
				var value = this.s_rspns_prefix + s_rspns_values;
				//alert(value);
				var hidden = Ext.getDom(this.s_rspns_id);
				//console.info(hidden);
				if(hidden.value == "")
					hidden.value = value;
				else {
					var a_hidden = hidden.value.split(this.a_delims[1]);
					//alert(a_hidden.length);
					a_hidden[this.i_row_index-1] = value;
					hidden.value = a_hidden.join(this.a_delims[1]);
					//alert(a_hidden.join(this.a_delims[1]));
					//alert(this.i_row_index);
				}
				var index = this.i_row_index + 1; //plus 1 because the domquery below is a 1 based index
				var el_tr = $qn('tr:nth(' + index + ')', 'tabmini_' + this.s_rspns_id);
				$qn('a.ico_remove', el_tr).setAttribute('value', value);
				$qn('td:first-child a', el_tr).innerHTML = s_name;
			}
			//if adding...
			else {
				var a_fields = [
					{tag:'td', title:s_name, children: [
						{tag:'a', href:'#', cls:'addonlink', html:s_name}
					]},
					{tag:'td', title:s_type, 
						html:'<span value="' + this.curlyReplace(this.acty_type_id) + '">' + s_type + '</span>'
					}
				];
				var othis = this;
				var fn_add = function() {
					var hidden = Ext.getDom(othis.s_rspns_id);
					if(hidden.value == "")
						var a_value = [];
					else
						var a_value = hidden.value.split(othis.a_delims[1]);
					a_value.push(othis.s_rspns_prefix + s_rspns_values_real); //make sure value BEFORE curlyreplace is in here
					hidden.value = a_value.join(othis.a_delims[1]);
				}
				s_rspns_values = othis.curlyReplace(othis.s_rspns_prefix) + s_rspns_values;
				this.o_fn.uiGridMini_add(a_fields, this.s_tab_id, s_rspns_values, false, fn_add, this.a_delims[1]);
			}
			this.dlg.hide();
		}
		else
			Ext.MessageBox.alert('Error', 'Please check that you have filled in all required fields');
	}
	
	//when an addon is selected
	,selectAddon: function(el) {
		var parent_tr = Ext.get(el).findParentNode('tr');
		//console.info(parent_tr.rowIndex);
		var value = $qn('a.ico_remove', parent_tr).getAttribute('value');
		var type_id = $qn('span', parent_tr).getAttribute('value');
		var parent_table = Ext.get(el).findParentNode('table');
		var id_main = parent_table.id.substr(String('tabmini_').length);
		var a_values = value.split(this.a_delims[0]);
		var a_values_sliced = a_values.slice(0, 2);
		var s_rspns_prefix = a_values_sliced.join(this.a_delims[0]) + this.a_delims[0];
		
		var o_act = {
			b_new: true,
			s_acty_type_id: type_id, 
			s_cd: 'O',
			s_acty_acty_id: this.s_id, 
			s_acty_acty_crtd_id: this.st_acty.acty_crtd_id,
			s_tab_id: parent_table.id,
			s_rspns_id: id_main,
			s_rspns_prefix: s_rspns_prefix,
			o_fn: { uiGridMini_add: this.uiGridMini_add, uiGridMini_remove: this.uiGridMini_remove },
			i_row_index: parent_tr.rowIndex
		}
		//if the value array is only 2, then it has not been edited, so get the values...
		if(a_values.length == 2) {
			o_act.b_new = false;
			o_act.s_id = a_values[1];
		}
		
		if(o_act.b_new)
			o_act.s_edit_values = a_values[2];
		
		var o_acty = new star.Activity(o_act);
		o_acty.init();
	}
	
	//send activity to reviewer or approver
	,sendActivity: function(s_to, s_msg) {
		//make sure message is entered
		if(Ext.isEmpty(s_to)) {
			Ext.MessageBox.alert("Error", "There do not appear to be any reviewers/approvers available at this post");
			return false;
		} else if (Ext.isEmpty(s_msg)) {
			Ext.MessageBox.alert("Error", "Please enter a message");
			return false;
		}
		Ext.MessageBox.hide(); //hide message box if shown
		
		//if form is defined (that is when editing or creating...), save and send through form
		if(Ext.get('acty_frm_' + this.s_cd)) {
			//add new hidden fields to form
			$dh.append('acty_frm_' + this.s_cd, {tag:'input', name:'sendTo', id:'sendTo', value:s_to, type:'hidden'});
			$dh.append('acty_frm_' + this.s_cd, {tag:'input', name:'sendMsg', id:'sendMsg', value:s_msg, type:'hidden'});
			this.a_flds.push(new Ext.form.Field({applyTo:'sendTo'}));
			this.a_flds.push({xtype:'field', applyTo:'sendMsg'});
			this.save(false, 'Please click YES to send it for review', 'review');
		}
		//otherwise just save and send with the non form values
		else {
			var b_dates = this.checkDates(false, this.st_acty.acty_start_dt, this.st_acty.acty_end_dt);
			if(!b_dates)
				Ext.MessageBox.alert('Error', this.s_msg_date);
			else {
				$conn.request({
					params: {	
						s_resourceType: 'component'
						,s_resource: 'activities'
						,s_method: 'saveActivity'
						,acty_id: this.st_acty.acty_id
						,b_saveResponses: false
						,s_status: 'review'
						,acty_nm_a: this.st_acty.acty_nm
						,acty_type_id: this.acty_type_id
						,acty_start_dt: this.st_acty.acty_start_dt
						,acty_end_dt: this.st_acty.acty_end_dt
						,acty_type_nm: this.acty_type_nm
						,s_taskID: this.s_task_id
						,sendTo: s_to
						,sendMsg: s_msg
						,rnd: new Date().getTime()
					},
					callback: function(options,b_success,response) {
						if(b_success) {
							var o_response = Ext.decode(response.responseText);
							var o_data =  o_response.st_data;
							if(o_data.s_status != "error") {
								this.dlg.hide();
								star.MyTasks.updateCount(o_data.i_tasks);
								Ext.MessageBox.alert('Status', 'This activity has been successfully sent for review');
								$sect.sections[$sect.s_curr_sect].reloadGrid(true);
							}
							else
								Ext.MessageBox.alert('Error', 'This activity could not be sent for review');
						}
					},
					failure: function() {
						Ext.MessageBox.alert('Error', 'This activity could not be sent for review');
					},
					scope: this
				});
			}
		}
		
		//hide menu
		this.menu_send.hide(true);
		
		//save activity
		
	}
	
	,sendReviewMenu: function() {
		// if the menu was already created then simply return it
		if(this.menu_send)
			return this.menu_send;
		
		var a_items = [];
		var sub_menu;
		
		var s_reviewers = '<select id="selectReviewers">';
		
		//var a_data = [];
		//create a simple store
		Ext.each(["approvers","reviewers"], function(iitem, iindex) {
			Ext.each(this.st_reviewers["q_"+iitem].data.USR_ID, function(aitem, aindex) {
				var citem = this.st_reviewers["q_"+iitem].data;
				var s_nm = citem.PRSN_FRST_NM[aindex] + ' ' + citem.PRSN_LAST_NM[aindex];
				var s_value = citem.USR_ID[aindex] + '|' + citem.PRSN_FRST_NM[aindex] + '|' + citem.PRSN_LAST_NM[aindex];
				s_value += '|' + citem.EMAIL_ADRS_TXT[aindex];
				var cls = (iitem == "approvers") ? ' class="opt_approve"' : '';
				s_nm = (iitem == "approvers") ? s_nm + ' (A)' : s_nm;
				//a_data.push([citem.EMAIL_ADRS_TXT, citem.PRSN_FRST_NM[aindex] + ' ' + citem.PRSN_LAST_NM[aindex]]);
				s_reviewers += '<option' + cls + ' value="' + s_value + '">' + s_nm + '</option>';
			}, this);
		}, this);
		
		s_reviewers += '</select>';
		
		var sub_menu = new Ext.menu.Menu({
			id:'sendReviewMenu',
			hideOnClick: false,
			subMenuAlign: 'c-c',
			cls:'msg_review_body',
			items: [ '<div id="sendReviewMenu"><div class="menu-title-dark">Please select a reviewer</div>'
				+ '<div class="bold">Send To:</div>' 
				+ s_reviewers
				+ '<div class="bold">Message to add:</div>'
				+ '<textarea id="msgReviewers" rows="5"></textarea>'
				+ '<div id="btn_sendreviewers"></div></div>'
			]
		});
		
		sub_menu.on('show',function(sb){
			new Ext.Button({
				renderTo:'btn_sendreviewers',
				cls: 'btn-no-icon',
				text: 'Send for review',
				//tooltip: 'Send for review',
				scope: this,
				handler: function() { 
					this.sendActivity(Ext.getDom('selectReviewers').value, Ext.getDom('msgReviewers').value);
				}
			});
			var msgReviewers = Ext.get('msgReviewers');
			//add key listener for 'enter' for textarea, since menu 'cancels' it...
			msgReviewers.addKeyListener(13, function() {
				this.dom.value += '\n\r';
			}, msgReviewers);
			// hide this menu whenever the dialog is hidden
			this.dlg.on('hide',function(){
				sub_menu.removeAll();
				sub_menu.getEl().remove();
			},this, {single:true});
		}, this, {single:true});
		
		return sub_menu;

	}
	
	,setButtons: function(el) {
		var a_buttons_new = [];
		
		var fn_edit = function() {
			//this.dlg.body.mask('Building form...');
			var tabs = this.dlg.getTabs();
			//show edit panel
			tabs.unhideTabStripItem('tab_edit_' + this.s_cd);
			tabs.activate('tab_edit_' + this.s_cd);
			//hide view panel
			tabs.hideTabStripItem('tab_acty_' + this.s_cd);
			
			this.edit(tabs.findById('tab_edit_' + this.s_cd).body);
			//this.create.defer(10,this,[this.dlg.getTabs().getTab('tab_edit_' + this.s_cd).bodyEl]);
		}
		
		//set buttons
		if(this.a_buttons) {
			Ext.each(this.a_buttons, function(item) {
				var b_nopush = false;
				if(item.s_name != "draft") {
					Ext.applyIf(item, {ctCls:'btn-force'});
					if(item.s_name == "clone") {
						item.menu = {items:['<span class="menu-title">Please choose the kind of '+this.s_type_name+'</span>']};
						Ext.each(item.a_types,function(item2){
							item.menu.items.push({
								text: item2.s_name
								,handler: function(){
									this.clone({s_acty_type_id:item2.s_id});
								}
								,scope: this
							});	
						},this);
						delete item.a_types;
						item.scope = this;
					}
					if(item.s_name == "delete") {
						item.handler = function() {
							this.deleteActivity(this.s_id);
						};
						item.scope = this;
					}
					if(item.s_name == "edit") {
						this.b_edit = true;
						item.handler = fn_edit;
						item.scope = this;
					}
					if(item.s_name == "approve") {
						if(this.b_show_approve_on_view) {
							this.s_approve_msg = item.s_msg;
							this.menu_notify = this.notifyUsersMenu();
							item.menu = this.menu_notify;
						}
						else
							b_nopush = true;
					}
					if(item.s_name == "send") {
						if(!this.st_reviewers) 
							b_nopush = true;
						if(!this.b_task || (this.b_task && !this.b_userownstask))
							b_nopush = true;
						else {
							//var a_items = this.sendReviewMenu();
							//save the menu in the this scope to use later
							//this.menu_send = new Ext.menu.Menu({items:a_items, id:'sendReviewMenu'});
							//now add to button's menu property
							//item.menu = this.menu_send;
							this.menu_send = this.sendReviewMenu();
							item.menu = this.menu_send;
							
						}
					}
					if(!b_nopush)
						a_buttons_new.push(item);
				}
			}, this);
		}
		else if(this.s_cd != 'A' && this.s_cd != 'I') {
			//show if it's not a result
			//if result, then only show buttons if there are edit rights
			if(this.s_cd != 'R' || (this.s_cd == 'R' && this.b_edit_results)) {
				a_buttons_new.push({
					s_name:'delete',
					text:'Delete',
					tooltip:'Delete this ' + this.s_type_name,
					icon: "images/ico_but_delete.gif",
					ctCls:'btn-force',
					handler: function() { this.deleteActivity(this.s_id); },
					scope:this
				});
				
				a_buttons_new.push({
					s_name:'edit',
					text:'Edit',
					tooltip:'Edit this ' + this.s_type_name,
					icon: "images/ico_but_edit.gif",
					ctCls:'btn-force',
					handler: fn_edit,
					scope:this
				});
			}
		}

		//apply buttons to dialog
		this.dlg.setButtons('tab_acty_' + this.s_cd, a_buttons_new);
		
	}
	
	,setButtons4Form: function(el) {
		var a_buttons = [{
			text: 'Spell'
			,tooltip:'Spell-Check'
			,icon: 'images/ico_but_spell.gif'
			,ctCls: 'btn-force'
			,scope: this
			,handler:function(){
				// build a list of fields to be spell checked
				var a_flds = ['acty_nm_'+this.s_cd];
				var o_fld;
				for (var i=0; i < this.a_qstns.length; i++) {
					o_fld = this.a_qstns[i];
					if((o_fld.s_datatype == 'text' || o_fld.s_datatype == 'blob') 
						&& (o_fld.s_ui == 'textarea' || o_fld.s_ui == 'textbox')
						&& this.frm_acty.findField(o_fld.s_name_real).getValue().length)
					{
						a_flds.push(o_fld.s_name_real);
					}
				};
				var scroll_el = this.frm_acty.el.up('div',1);
				//scroll_el.scrollTo('top',Ext.getDom('rspn_textarea_{E6B0065D-D40C-4709-8E1D-95F5AFA8179C}_{2003E664-9BFE-4899-930F-0C2B91D16F77}_blob').offsetTop-50,true);
				spell(scroll_el,a_flds);
			}
		}];
		//for activities only...
		if(this.s_cd == 'A' && this.a_buttons) {
			Ext.each(this.a_buttons, function(item) {
				if(item.s_name == "send" || item.s_name == "draft" || item.s_name == "delete" || item.s_name == "approve") {
					item.scope = this;
					item.ctCls = 'btn-force';
					if(item.s_name == "delete") {
						item.hander = function() { this.deleteActivity(this.s_id); }
					}
					if(item.s_name == "approve") {
						this.s_approve_msg = item.s_msg;
						if(this.b_new) {
							item.handler = function() { this.save(true, false, 'approve'); };
							item.text += ' ...';
						} else {
							this.menu_notify = this.notifyUsersMenu();
							item.menu = this.menu_notify;
						}
					}
					//save/draft button
					if(item.s_name == "draft") {
						var s_msg = '<strong class="bold">Click OK to save the activity.</strong>\
									<br /><br />Please Also Note:<br /><br />\
									<ul class="list">';
						Ext.each(item.a_msgs, function(citem) {
							s_msg += '<li>' + citem + '</li>';
						});
						s_msg +=	'</ul>';
						item.handler = function() {
							this.save(false, s_msg, 'draft');
						};
					}
					//send for review
					if(item.s_name == "send") {
						//var a_items = othis.sendReviewMenu();
						//save the menu in the this scope to use later
						//othis.menu_send = new Ext.menu.Menu({items:a_items, id:'sendReviewMenu'});
						//now add to button's menu property
						//item.menu = othis.menu_send;
						
						this.menu_send = this.sendReviewMenu();
						item.menu = this.menu_send;
					}
					a_buttons.push(item);
				}
			}, this);
		}
		//for all other types except activities...
		else {
			if(this.s_cd == 'R' && this.b_edit_results)
				a_buttons.push({
					s_name:'delete',
					text:'Delete',
					tooltip:'Delete this ' + this.s_type_name,
					icon: "images/ico_but_delete.gif",
					ctCls:'btn-force',
					handler: function() { this.deleteActivity(this.s_id); },
					scope:this
				});
			
			//var div = $dh.append(document.body, {tag:'div', id:'btn_save_other'});
			a_buttons.push({
				ctCls: 'btn-force',
				icon: 'images/ico_but_disk.gif',
				id:'btn_save_other',
				s_name: 'btn_save_other',
				text: 'Save ' + this.s_type_name,
				tooltip: 'Save ' + this.s_type_name,
				scope:this,
				handler: function() {
					if(this.s_cd == "O")
						this.saveAddon();
					else
						this.save();
				}
			});
		}
		this.dlg.setButtons('tab_edit_' + this.s_cd, a_buttons);
	}
	
	,showChanges: function(el){
		if(!this.b_show_changes)
			return;
		
		// function to toggle changes
		var showHideChange = function(){
			var s_chg_id = this.id;
			var div = Ext.get(s_chg_id+'_changes');
			if(div.getStyle('display') == 'block'){
				// switch the image and title
				this.src = 'images/collapsed.gif';
				this.title = 'Click to show proposed changes';
				div.setStyle('display','none');
			} else {
				// switch the image and title
				this.src = 'images/expanded.gif';
				this.title = 'Click to hide changes';
				div.setStyle('display','block');
			}
		};
		
		// setup toggle for changes
		var a = $q('DIV.acty_changed_icon',el.dom);
		Ext.each(a,function(o_div){
			Ext.get(o_div.firstChild).on('click',showHideChange,o_div.firstChild)
		});
	}
	
	,showDetails: function(){
		// activity details
		var st_acty = this.st_acty;
		st_acty.s_type_name = this.s_type_name;
		st_acty.s_chg = '';
		st_acty.acty_fields = '';
		var s_details_chg_icon = ''; // var that holds the change icon if necessary
		this.o_template_data.acty_details = [];
		if(this.b_show_changes){
			var s_chg_id = this.s_cd + '_detail'; // id to be used to link the change img with the changes div
			s_details_chg_icon = '<div class="acty_changed_icon">'
								//+ '<a href="#" title="Click to see the proposed changes">'
								+ '<img src="images/collapsed.gif" id="'+s_chg_id+'" border="0" width="9" height="9" '
								+ 'title="Click to see the proposed changes" />'
								//+ '</a>'
								+ '</div>';
			var st_acty_changes = this.st_acty_changes;
			for(var k in st_acty)
				if(typeof st_acty_changes[k] == 'undefined')
					st_acty_changes[k] = st_acty[k];
			st_acty_changes.s_chg = ' id="'+s_chg_id+'_changes" class="acty_changed" style="display:none"';
			if(this.s_cd == 'A'){
				st_acty_changes.acty_fields = '<dt>Start Date</dt><dd>'+st_acty_changes.acty_start_dt+'</dd>'
									+ '<br clear="left"/>'
									+ '<dt>End Date</dt><dd>'+st_acty_changes.acty_end_dt+'</dd>'
									+ '<br clear="left"/>'
									+ '<dt>Include in Highlight Report</dt><dd>'
									+ (st_acty_changes.acty_hlght_ind=='Y' ? '<strong class="bold">YES</strong>' : 'No') + '</dd>'
									+ '<div class="brclear"></div>';
			}
			this.o_template_data.acty_details.push(st_acty_changes);
		}
		if(this.s_cd == 'A' || this.s_cd == 'I'){
			st_acty.acty_fields = '<dt class="relative">Start Date</dt><dd class="relative">'+st_acty.acty_start_dt+'</dd>'
								+ '<br clear="left" />';
			if(this.s_cd == 'A') {
				st_acty.acty_fields += '<dt class="relative">End Date</dt><dd class="relative">'+st_acty.acty_end_dt+'</dd>'
								+ '<br clear="left" />'
								+ '<dt class="relative">Include in Highlight Report</dt><dd class="relative">'
								+ (st_acty.acty_hlght_ind=='Y' ? '<strong>YES</strong>' : 'No') + '</dd>'
								+ '<div class="brclear"></div>';
			}
		}
		st_acty.cls = ' class="relative"';
		//star.tpl_acty.add('acty_details',st_acty);
		this.o_template_data.acty_details.push(st_acty);
		
		// update activity details header
		//star.tpl_acty.add('acty_details_header',{s_type_name:this.s_type_name, s_details_chg_icon:s_details_chg_icon});
		this.o_template_data.acty_details_header = {s_type_name:this.s_type_name, s_details_chg_icon:s_details_chg_icon};
	}
	
	,showQnA: function(){
		// loop through and build each question and its responses
		this.o_template_data.question = [];
		for(var i=0;i<this.a_qstns.length;i++){
			var o_qstn = this.a_qstns[i];
			// get the approved version of answers
			var s_rspns = '<div>' 
							+ this.showQnAResponses(o_qstn,o_qstn.a_rspns) 
						+ '</div>';
			var s_rspns_changed = '';
			var s_change = '';
			// if necessary get the proposed changes
			if(this.b_show_changes && o_qstn.a_rspns_changed){
				var s_chg_id = this.s_cd + '_' + o_qstn.s_id.toLowerCase().replace('{','','g').replace('}','','g'); // id to be used to link the change img with the changes div
				s_change = '<div class="acty_changed_icon">'
								//+ '<a href="#" title="Click to see the proposed changes">'
								+ '<img src="images/collapsed.gif" id="'+s_chg_id+'" border="0" width="9" height="9" '
								+ 'title="Click to see the proposed changes" />'
								//+ '</a>'
							+ '</div>';
				s_rspns_changed = '<div id="'+s_chg_id+'_changes" class="acty_changed" style="display:none">'
									+ '<div class="padded">' + this.showQnAResponses(o_qstn,o_qstn.a_rspns_changed) + '</div>'
								+ '</div>';
			}
			
			// add the question and answers (and changes) to the template
			/* star.tpl_acty.add('question',{
				s_question:o_qstn.s_question
				,s_change:s_change
				,s_rspns:s_rspns
				,s_rspns_changed:s_rspns_changed
			}); */
			this.o_template_data.question.push({
				s_question:o_qstn.s_question
				,s_change:s_change
				,s_rspns:s_rspns
				,s_rspns_changed:s_rspns_changed
			});
		}
	}
	
	,showQnAResponses: function(o_qstn,a_rspns){
		// build the responses string for a question
		var s_rspns = '';
		
		//if required then create required fields object to house the required field
		if(o_qstn.b_required) {
			if(!this.o_requiredFields)
				this.o_requiredFields = {};
			var s_name = 'rspn_' + o_qstn.s_ui + '_' + o_qstn.s_id + '_' + o_qstn.s_qstn_id + '_' + o_qstn.s_datatype;
			if(!this.o_requiredFields[s_name]) {
				this.o_requiredFields[s_name] = {};
				this.o_requiredFields[s_name].title = o_qstn.s_question;
				this.o_requiredFields[s_name].value = '';
				if(o_qstn.s_ui == 'slidernum' || o_qstn.s_ui == 'sliderpercent')
					this.o_requiredFields[s_name].b_nozero = true;
				if(o_qstn.s_ui == "textbox" && o_qstn.s_datatype == "numeric")
					this.o_requiredFields[s_name].b_checkinput = true;
			}
		}
		
		for(var j=0;j<a_rspns.length;j++){
			var o_rspn = a_rspns[j];
			/* SLIDERS */
			if(o_qstn.s_ui == 'slidernum' || o_qstn.s_ui == 'sliderpercent'){
				// the list structure containing the array of possible responses for this question
				var o_list = this.st_pssbl_rspns.st_lists[o_qstn.s_list.toLowerCase()];
				// position in the above list of the currently selected possible response
				var i_rspn = this.st_pssbl_rspns.st_rspns[o_rspn.pssbl_rspns_id.toLowerCase()];
				if(i_rspn == undefined || (o_list[i_rspn-1].pssbl_rspns_actv_ind == 'N' && o_rspn.val == '0'))
					continue;
					
				if(typeof o_list != 'undefined' && typeof i_rspn != 'undefined' && o_list[i_rspn-1])
					s_rspns += '<dt style="width:250px" class="relative">' + o_list[i_rspn-1].pssbl_rspns_rspns_txt + '</dt>';
				else
					s_rspns += 'unknown';
				s_rspns += '<dd class="relative">' + o_rspn.val;
				if(o_qstn.s_ui == 'sliderpercent')
					s_rspns += '%';
				s_rspns += '</dd> ';
				s_rspns += '<br clear="left" />';
				if(o_qstn.b_required)
					this.o_requiredFields[s_name].value += parseInt(o_rspn.val);
			/* PEOPLE */
			} else if(o_qstn.s_ui == 'people'){
				var s_prsn_id = o_rspn.prsn_id.toLowerCase();
				var s_role_id = o_rspn.role_id.toLowerCase();
				if(this.st_prsns[s_prsn_id]){
					s_rspns += this.st_prsns[s_prsn_id].prsn_frst_nm + ' ' 
							+ this.st_prsns[s_prsn_id].prsn_last_nm;
					if(this.st_prsn_roles.st_roles[s_role_id]){
						var k = this.st_prsn_roles.st_roles[s_role_id]-1;
						s_rspns += ' (' + this.st_prsn_roles.a_roles[k].prsn_role_desc + ')';
						if(o_qstn.b_required) this.o_requiredFields[s_name].value += s_rspns;
					} else
						s_rspns += ' <i class="i">(unknown role)</i>';
				} else
					s_rspns += '<i class="i">person account for person id ' + o_rspn.prsn_id + ' no longer exists</i>';
				s_rspns += '<br />';
			/* CITIES */
			} else if(o_qstn.s_ui == 'city'){
				// locate the current city in the city structure
				var i_city = this.st_city.st_cities[o_rspn.city_id.toLowerCase()];
				if(typeof i_city != 'undefined' && this.st_city.a_cities[i_city-1]) {
					s_rspns += this.st_city.a_cities[i_city-1].city_nm;
					if(o_qstn.b_required) this.o_requiredFields[s_name].value += s_rspns;
				}
				else
					s_rspns += '<i class="i">unknown city or city no longer assigned to this post</i>';
				s_rspns += '<br />';
			/* MEDIAMATRIX */
			} else if(o_qstn.s_ui == 'mediamatrix'){
				// locate the current city in the city structure
				var i_mediamatrix = this.st_mediamatrix.st_media[o_rspn.mediamatrix_id.toLowerCase()];
				if(typeof i_mediamatrix != 'undefined' && this.st_mediamatrix.a_media[i_mediamatrix-1]) {
					s_rspns += this.st_mediamatrix.a_media[i_mediamatrix-1].mediamatrix_nm;
					if(o_qstn.b_required) this.o_requiredFields[s_name].value += s_rspns;
				}
				else
					s_rspns += '<i class="i">unknown media outlet or outlet no longer assigned to this country</i>';
				s_rspns += '<br />';
			/* PPS */
			} else if(o_qstn.s_ui == 'pps'){
				// locate the current city in the city structure
				var i_pps = this.st_pps.st_pps[o_rspn.pps_id.toLowerCase()];
				if(typeof i_pps != 'undefined' && this.st_pps.a_pps[i_pps-1]) {
					s_rspns += this.st_pps.a_pps[i_pps-1].pps_nm;
					if(o_qstn.b_required) this.o_requiredFields[s_name].value += s_rspns;
				}
				else
					s_rspns += '<i class="i">unknown pps no longer assigned to this post</i>';
				s_rspns += '<br />';
			/* SELECTBOXES */
			} else if(o_qstn.s_ui == 'selectbox' || o_qstn.s_ui == 'selectboxmulti'){
				// the list structure containing the array of possible responses for this question
				var o_list = this.st_pssbl_rspns.st_lists[o_qstn.s_list.toLowerCase()];
				// position in the above list of the currently selected possible response
				var i_rspn = this.st_pssbl_rspns.st_rspns[o_rspn.pssbl_rspns_id.toLowerCase()];
				if(typeof o_list != 'undefined' && typeof i_rspn != 'undefined' && o_list[i_rspn-1]) {
					s_rspns += o_list[i_rspn-1].pssbl_rspns_rspns_txt;
					if(o_qstn.b_required) this.o_requiredFields[s_name].value += s_rspns;
				}
				else
					s_rspns += '<i class="i">unknown</i>';
				s_rspns += '<br />';
			/* MEDIA */
			} else if(o_qstn.s_ui == 'media'){
				if(this.st_media && o_rspn) {
					s_rspns += this.st_media[o_rspn.pssbl_rspns_id.toLowerCase()] + '<br/>';
					if(o_qstn.b_required) this.o_requiredFields[s_name].value += s_rspns;
				}
				else
					s_rspns += '<i class="i">not specified</i>';
			/* FILEUPLOADS */
			} else if(o_qstn.s_ui == 'fileupload' || o_qstn.s_ui == 'fileuploadmulti'){
				var s_pth = 'files/index.cfm/'+o_rspn.s_id+'/'+o_rspn.s_file;
				var s_title = 'Click to view '+o_rspn.s_file;
				s_rspns += '<a href="'+s_pth+'" target="_blank" title="'+s_title+'">'
						+ '<img src="images/fileicons/'+o_rspn.s_img+'.gif" border="0" align="absmiddle" /></a> '
						+ '<a href="'+s_pth+'" target="_blank" title="'+s_title+'">'+o_rspn.s_file+'</a>'
						+ ' ('+o_rspn.s_filesize+') ';
				if(o_rspn.b_highlight)
					s_rspns += '(<span class="bold">Primary</span>)';
				if(o_rspn.s_caption.length)
					s_rspns += '<br />Caption: ' + o_rspn.s_caption;
				s_rspns += '<br />';
			/* ERRTHING ELSE */
			} else {
				if(typeof o_rspn != "undefined" && o_rspn.val && (parseInt(o_rspn.val) || o_rspn.val.length)) {
					s_rspns += o_rspn.val + '<br />';
					if(o_qstn.b_required) this.o_requiredFields[s_name].value += s_rspns;
				}
				else
					s_rspns += '<i class="i">not specified</i>';
			}
			/* if(typeof console != 'undefined'){
				//console.log(o_qstn.s_ui);
				//console.log(o_qstn);
				//console.log(o_rspn);
			} */

		} // end loop through a_rspns
		
		// if there are no responses then output a message indicating that
		if(!a_rspns.length)
			s_rspns += '<i class="i">not specified</i>';
			
		return s_rspns;
	}
	
	//show results
	,showResults: function() {
		//this.dlg.body.mask('Creating results...');
		/* var s_body = '<div class="dlg_frm">'
						+ '<br/><div id="btn_add_result"></div><br/><br/>'
							+ '<div class="grid-inner">'
								+ '<div class="header"><span>List of results</span></div>'
								+ '<div id="grid_results"></div>'
							+ '</div>'
					+ '</div>';
		//this.dlg.o_panels.tab_result.bodyPanel.getEl().update(s_body);
		this.dlg.getTabs().findById('tab_result').body.update(s_body); */
		
		var othis = this;
		
		var tbar_config = {cls:'header', items:['List of Results']};
		//if there are buttons and user is able to edit, then the user can edit and create results
		if(this.a_buttons && this.b_edit) {
			//create new results type button
			var a_rspns_types = [];
			Ext.each(this.st_result_types.a_types, function(item, index) {
				a_rspns_types.push({
					text: item.s_nm,
					scope:this,
					handler: function() {
						var o_acty = new star.Activity({
							s_acty_type_id:item.s_id, b_new:true, s_cd:'R', s_acty_acty_id:this.s_id, 
								s_acty_acty_crtd_id:this.st_acty.acty_crtd_id, grid_ds:grid_results.store,
								o_results: this.st_results,
								s_acty_acty_nm: this.st_acty.acty_nm
						});
						o_acty.init();
					}
				});
			}, this);
			a_rspns_types.unshift('<span class="menu-title">Please choose a result type</span>');
			tbar_config.items.push('->');
			tbar_config.items.push(
				new Ext.Button({
					//renderTo:'btn_add_result', 
					text:'Add a New Result', 
					menu: new Ext.menu.Menu({items: a_rspns_types}), 
					icon:'images/add.png',
					ctCls:'btn-force'
				})
			)
		}
		var tbar = new Ext.Toolbar(tbar_config);
		
		//create results grid
		var a_cols = [
			{id:'acty_nm', header:"Name", dataIndex:"acty_nm", sortable:true}, 
			{id:'acty_type_nm', header:"Type", dataIndex:"acty_type_nm", width:120, sortable:true},
			{id:'acty_hlght_ind', header:"Highlight", dataIndex:"acty_hlght_ind", width:75, sortable:true
				,renderer:function(value, cell, record, rowIndex) {
					var s_name = "highlight_" + record.id + "_" + rowIndex;
					var s_checked = "";
					if(value == "Y")
						s_checked = ' checked="checked"';
					if(othis.b_edit) {
						var input = '<div class="centered">\
										<input class="resulthghl" id="' + s_name + '" \
											type="checkbox"' + s_checked + ' />\
									</div>';
					}
					else
						var input = (value == "Y") ? "Yes" : "No";
					return input;
				}
			}
		];
		
		var tab = this.dlg.getTabs().getActiveTab();
		var grid_results = star.Grid.create('grid_results', {
			a_columns: a_cols
			,o_meta: {root: 'a_results', id: 'acty_rslt_rslt_id'}
			,o_proxy: new Ext.data.MemoryProxy(this.st_results)
			,s_id_field: 'acty_rslt_rslt_id'
			,s_autoExpandColumn: 'acty_nm'
			,o_baseParams: {}
			,o_sortInfo: {field:'acty_nm',direction:'ASC'}
			,b_paging: false
			,b_page_displayInfo: false
			//,height:tab.getSize().height - 160
			,cls:'grid-inner box'
			,tbar:tbar
		});
		// open the result when a row is clicked
		grid_results.on('rowclick',function(g,rowIndex,e){
			var selModel = g.getSelectionModel();
			var rec = selModel.getSelected();
			if(rec)
					new star.Activity({
						s_acty_type_id: rec.acty_type_id, 
						s_cd:'R', 
						s_acty_acty_id: this.s_id, 
						s_acty_acty_crtd_id: this.st_acty.acty_crtd_id, 
						grid_ds: grid_results.store,
						o_results: grid_results.store.reader.jsonData,
						i_grid_row: rowIndex,
						o_grid_row: rec,
						s_id: rec.id,
						s_acty_acty_nm: this.st_acty.acty_nm,
						b_edit_results: this.b_edit
					}).init();

		},this);
		// once the records are loaded into the results grid then let's
		// add the highlight result event if necessary
		grid_results.store.on('load',function(s){
			var a_opts = $q('input[type=checkbox]',grid_results.body.dom);
			if(a_opts.length){
				Ext.each(a_opts,function(opt){
					Ext.EventManager.on(opt,"click", function() {
						var s_msg = 'Please keep in mind that only one result can be highlighted at a time.<br/><br/>\
								Any result selected to be highlighted will show up in highlight reports featuring this activity.<br/><br/>';
						var b_on = !opt.checked;
						if(b_on)
							s_msg += '<span class="bold">Clicking YES will immediately REMOVE this result\'s highlighted status.</strong>';
						else
							s_msg += '<span class="bold">Clicking YES will immediately HIGHLIGHT this result.</strong>';
						Ext.MessageBox.confirm('Confirm', s_msg, 
							function(s_btn) {
								if(s_btn == "yes") {
									//opt.checked = b_on; // set the checkbox
									var s_highlight = b_on ? "N" : "Y";
									var rslt_id = opt.id.split('_')[1];
									var rowIndex = opt.id.split('_')[2];
									var s_conn = $conn.request({
										params: {
											s_resourceType: 'component'
											,s_resource: 'activities'
											,s_method: 'highlightResult'
											,s_acty_id: othis.s_id
											,s_result_id: rslt_id
											,s_highlight: s_highlight
											,rnd: new Date().getTime()
										}
										,callback: function(options,b_success,response){
											if(b_success) {
												var o_response = Ext.decode(response.responseText);
												var o_data =  o_response.st_data;
												if(o_response.s_status == "success") {
													var st_results = grid_results.store.reader.jsonData;
													if(s_highlight == "Y") {
														Ext.each(grid_results.store.data.items, function(item, index) {
															if(item.id == rslt_id) {
																st_results.a_results[index].acty_hlght_ind = 'Y';
															}
															else 
																st_results.a_results[index].acty_hlght_ind = 'N';
														});
													}
													else
														st_results.a_results[rowIndex].acty_hlght_ind = 'N';
													//console.info(st_results);
													grid_results.store.proxy = new Ext.data.MemoryProxy(st_results);
													grid_results.store.reload();
												}
											}
										}
									});
								}
							}
						);
					},this,{stopEvent:true})
				});
			}
		},this);

		tab.add({
			xtype:'panel'
			,layout:'border'
			,items: {
				region:'center'
				,margins:'30 20 40 20'
				,layout:'fit'
				,items:grid_results
			}
		});
		tab.doLayout();
		
	}
	
	,showTaskHeader: function(){
		// add task msg (if necessary)
		this.o_template_data.task_msg = [];
		if(this.b_task)
			//star.tpl_acty.add('task_msg',{b_userownstask:this.b_userownstask, s_task:this.s_task});
			this.o_template_data.task_msg = {b_userownstask:this.b_userownstask, s_task:this.s_task};
	}
	
	,ui_mediaSearch: function(i_width) {
		//get mini grid
		var el_media_search = Ext.get('media_search');
		var s_qstn_id = el_media_search.dom.getAttribute('s_qstn_id');
		var parent = el_media_search.findParent('.x-form-element');
		var tab = Ext.get(parent).next().next();
		
		var s_url =  star.Utils.buildUrl('component','activities','getPossibleResponses');
		var ds = new Ext.data.Store({
			proxy: new Ext.data.HttpProxy({
				url: s_url
			}),
			reader: new Ext.data.JsonReader({
				root: 'st_data.results',
				totalProperty: 'st_data.i_total',
				id: 'pssbl_rspns_id'
			}, [
					{name: 'pssbl_rspns_id'},
					{name: 'pssbl_rspns_rspns_txt'}
			])
			,baseParams: {dir:'ASC', limit:25, sort:'pssbl_rspns_rspns_txt', s_qstn_id: s_qstn_id}
		});
		
		// Custom rendering Template
		var resultTpl = new Ext.XTemplate(
			'<tpl for=".">',
				'<div class="search-item">',
					'<h3>{pssbl_rspns_rspns_txt}</h3>',
				'</div>',
			'</tpl>'
		);
		
		var othis = this;
		var search = new Ext.form.ComboBox({
			store: ds,
			id:'combo_media_search',
			applyTo:'media_search',
			itemSelector: 'div.search-item',
			emptyText:'Enter at least 3 characters to search',
			valueNotFoundText: 'Media not found',
			minChars:3,
			triggerAction:'query',
			displayField:'pssbl_rspns_rspns_txt',
			typeAhead: false,
			loadingText: 'Searching media...',
			width: i_width,
			//maxHeight:150,
			pageSize:25,
			queryParam:'s_keyword',
			hideTrigger:true,
			listAlign:'bl-tl',
			tpl: resultTpl,
			onSelect: function(obj) {
				var data = obj.data;
				var a_fields = [{tag:'td', title:data.pssbl_rspns_rspns_txt, html:data.pssbl_rspns_rspns_txt}];
				var s_value = obj.id + '_' + Ext.DomQuery.select('tr', tab).length + '_' + othis.commaReplace(data.pssbl_rspns_rspns_txt);
				this.reset();
				//this.collapse();
				othis.uiGridMini_add(a_fields, tab.id, s_value);
			}
		});
	}
	
	//people search
	,ui_peopleSearch: function(i_width) {
		//get mini grid
		var parent = Ext.get('ppl_search').findParent('.x-form-element');
		var tab = Ext.get(parent).next().next();
		
		//create new person button
		var btn = new Ext.Button({
			renderTo:'ppl_new',
			cls: 'btn-no-icon',
			text: 'Create a New Person',
			disabled: true,
			handler: function() {
				var othis = this;
				othis.el_minibody = tab.id;
				var prsn = new star.People();
				prsn.createPerson('Person', 'ppl_new', {i_width:this.dlg.getSize().width-50, i_height:this.dlg.getSize().height-50}, othis);
			},
			tooltip: 'Create a New Person',
			scope: this
		});
		
		var s_url =  star.Utils.buildUrl('component','people','getPeople');
		var ds = new Ext.data.Store({
			proxy: new Ext.data.HttpProxy({
				url: s_url
			}),
			reader: new Ext.data.JsonReader({
				root: 'st_data.results',
				totalProperty: 'st_data.i_total',
				id: 'prsn_id'
			}, [
					{name: 'prsn_id'},
					{name: 'prsn_last_nm'},
					{name: 'prsn_frst_nm'}
			])
			,baseParams: {dir:'ASC', limit:25, sort:'prsn_last_nm'}
		});
		
		//when datasource is done loading, enable the ppl button
		ds.on("load", function() {
			btn.enable();			   
		});

		// Custom rendering Template
		var resultTpl = new Ext.XTemplate(
			'<tpl for=".">',
				'<div class="search-item">',
					'<h3>{prsn_last_nm}, {prsn_frst_nm}</h3>',
				'</div>',
			'</tpl>'
		);
		
		var othis = this;
		
		var search = new Ext.form.ComboBox({
			store: ds,
			id:'combo_ppl_search',
			applyTo:'ppl_search',
			itemSelector: 'div.search-item',
			emptyText:'Enter at least 3 characters to search',
			valueNotFoundText: 'Person not found',
			minChars:3,
			triggerAction:'query',
			displayField:'prsn_last_nm',
			typeAhead: false,
			loadingText: 'Searching people...',
			width: i_width,
			maxHeight:150,
			//anchor:'60%',
			pageSize:10,
			queryParam:'s_search_keyword',
			hideTrigger:true,
			tpl: resultTpl,
			onSelect: function(obj) {
				var data = obj.data;
				var a_fields = [
					{tag:'td', title:data.prsn_last_nm, html:'<a href="#" class="editprsn">' + data.prsn_last_nm + '</a>'},
					{tag:'td', title:data.prsn_frst_nm, html:'<a href="#" class="editprsn">' + data.prsn_frst_nm + '</a>'}
				];

				this.reset();
				this.collapse();
				Ext.MessageBox.show({
					title:'Please choose a role',
					msg: othis.s_msg_roles,
					buttons: Ext.MessageBox.OKCANCEL,
					fn: function(b) {
						if(b=="ok") {
							var sel = Ext.getDom('prsn_role_select');
							var role_index = othis.st_prsn_roles.st_roles[sel.value.toLowerCase()] - 1;
							var sel_text = othis.st_prsn_roles.a_roles[role_index].prsn_role_desc;
							a_fields.push({tag:'td', title:sel_text, html:sel_text});
							othis.uiGridMini_add(a_fields, tab.id, obj.id + '_' + sel.value);
							btn.disable();
						}
					}//,
					//animEl: this.getEl()
				});
			}
		});
	}
	
	//add file ui
	,uiAddFile: function(el, id_main, i_width) {
		var el_file_container = Ext.getDom('fileall_' + id_main);
				
		//create upload file type
		var index_new = parseInt(el_file_container.getAttribute('index')) + 1;
		var el_id = id_main + '_' + index_new;
		$dh.append(el_file_container, 
			{tag:'input', type:'file', id:el_id, name:el_id, style:'margin-bottom:3px'}
		);
		
		//create extra fields for file upload
		$dh.insertBefore(el,
			{tag:'div', id:'extra_' + el_id, cls:'hidden fileextracontainer',
				children: [
					{tag:'i', html:'Enter caption for this file', cls:'i'},
					{tag:'input', type:'text', id:'caption_' + el_id, name: 'caption_' + el_id, maxlength:100},
					{tag:'br'},
					{tag:'input', type:'checkbox', id:'highlight_' + el_id, name:'highlight_' + el_id, cls:'filehighlight'}
				]
			}
		);
		
		//switch to new index
		el_file_container.setAttribute('index', index_new);
		
		//create config for form fields to be added
		var a_flds = [];
		a_flds.push({xtype:'field', applyTo:el_id});
		a_flds.push({xtype:'field', width:i_width, applyTo:'caption_' + el_id});
		a_flds.push({
			xtype:'field',
			boxLabel:'<i class="i">Check to set as primary photo</i>',
			applyTo:'highlight_' + el_id
		});
		
		if(this.b_init_filemini) {
			Ext.each(a_flds, function(o) {
				//add to ext form panel NOT form
				var fld = this.frm_acty_panel.add(o);
				//manually add to the form's items property
				this.frm_acty.items.items.push(fld);
			}, this);
		}
		else
			this.b_init_filemini = true;
		
		this.a_flds = this.a_flds.concat(a_flds);
		
		//add onchange event to file to show extra options when you select a file
		Ext.EventManager.on(el_id, "change", function() {
			Ext.get('extra_' + el_id).removeClass('hidden');
		});
	}
	
	//remove file ui
	,uiRemoveFile: function(el_id) {
		var file = this.frm_acty.findField(el_id).destroy();
		var caption = this.frm_acty.findField('caption_' + el_id).destroy();
		var highlight = this.frm_acty.findField('highlight_' + el_id).destroy();
		Ext.get('extra_' + el_id).remove();
	}
	
	//build mini grid table for "lists" (people, addons, fileuplaod)
	,uiGridMini: function(o_tab) {
		var tab_nm = (o_tab.tab_nm) ? o_tab.tab_nm : o_tab.o_hidden.name;
		var s_hidden = '';
		if(o_tab.o_hidden)
			s_hidden = ' idhidden="'+o_tab.o_hidden.name+'"';
		var s_input = '<table class="grid-mini" style="margin-top:15px" id="tabmini_' + tab_nm + '"'+s_hidden+'>\
						<tbody>\
							<tr>';
		var s_delim = (o_tab.s_delim) ? ' delim="' + o_tab.s_delim + '"' : '';
		Ext.each(o_tab.a_headers, function(item) {
			var s_width = '';
			var s_key = item;
			if(Ext.type(item) == "object") {
				s_width = ' width="' + item.width + '"';
				s_key = item.name;
			}
			s_input += '<th' + s_width + ' scope="col">' + s_key + '</th>'
		});
		
		s_input += '<th width="35" scope="col">Action</th>';
		s_input += '</tr>';
		
		Ext.each(o_tab.a_fields, function(item, index) {
			var s_class = (index % 2 == 0) ? ' class="nrow alt"' : 'nrow';
			s_input += '<tr' + s_class + '>';
			for(var i=0; i<item.length; i++) {
				var iscope = (i==0) ? ' scope="row"' : '';
				s_input += '<td' + iscope + '>' + item[i] + '</td>';
			}
			s_input += '<td align="center">\
							<a href="##" class="ico_remove" title="Remove" \
								idhidden="' + o_tab.o_hidden.name + '" \
								value="' + this.curlyReplace(o_tab.a_values[index]) + '"' + s_delim + '></a>\
						</td>\
					</tr>';
		}, this);
		
		s_input += '</tbody></table>';
		s_input += '<input type="hidden" \
			name="' + o_tab.o_hidden.name +'" \
			id="' + o_tab.o_hidden.name +'" \
			value="' + this.curlyReplace(o_tab.o_hidden.value) + '">';
		return s_input;
	}
	
	//add row to mini grid
	,uiGridMini_add: function(a_fields, id_tab, s_value, fn_remove, fn_add, s_delim) {
		//var id_hidden = id_tab.substr(String('tabmini_').length);
		var id_hidden = Ext.get(id_tab).dom.getAttribute('idhidden');
		var tbody = $qn("tbody", id_tab);
		var tr_rows = $q("tr", id_tab);
		var cls = (Ext.get(tr_rows[tr_rows.length-1]).hasClass('alt')) ? '' : 'alt';
		s_delim = (s_delim) ? ' delim="' + s_delim + '"' : '';
		var el_a = '<a href="##" class="ico_remove" title="Remove" \
						idhidden="' + id_hidden + '" \
						value="' + s_value + '"' + s_delim + '></a>';
		a_fields.push({tag:'td', align:'center', html:el_a});
		//create row
		var tr = $dh.append(tbody, {tag:'tr', cls: cls, children: a_fields});
		
		//add onclick event to remove icon
		Ext.EventManager.on(Ext.get(tr).child('a.ico_remove'), "click", 
			function(e, o) { 
				//console.info(this);
				this.uiGridMini_remove(o);
				//if extra remove function has been declared, run it as well
				if(fn_remove)
					fn_remove();
			}, 
			this, 
			{stopEvent:true}
		);
		
		//if add function is passed in, then use that
		if(fn_add) fn_add();
		//else use this default
		else {
			//add hidden field value
			var hidden = this.frm_acty.findField(id_hidden);
			var a_value = hidden.getValue().split(",");
			a_value.push(s_value);
			hidden.setValue(a_value.join(","));
		}
	}
	
	//remove row from mini grid
	,uiGridMini_remove: function(o) {
		Ext.MessageBox.confirm('Confirm', 'Are you sure you want to remove this item?', 
			function(s_btn) {
				if(s_btn == "yes") {
					var hidden = o.getAttribute("idhidden");
					var value  = o.getAttribute("value");
					var delim = o.getAttribute("delim") ? o.getAttribute("delim") : ",";
					//var field  = this.frm_acty.findField(hidden);
					//Ext.get(hidden)
					//var a_values = field.getValue().split(delim);
					var field = Ext.getDom(hidden);
					var a_values = field.value.split(delim);
					var a_values_new = [];
					//create new value for hidden field
					Ext.each(a_values, function(item) { 
						if(item != value)
							a_values_new.push(item);
					});
					field.value = a_values_new.join(delim);
					//remove row in mini grid
					var parent = Ext.get(o).findParent("tr");
					Ext.get(parent).remove();
					
					//refresh row classes
					var tr_rows = Ext.DomQuery.select("tr", Ext.get(o).findParent("tbody"));
					tr_rows.slice(1); //get rid of the first row (that's the header, we don't need that)
					Ext.each(tr_rows, function(o, i) {
						var row = Ext.get(o);
						if(row.hasClass('alt'))
							row.removeClass('alt');
						if(i % 2 == 0)
							row.addClass('alt');
					});
				}
			}
		);
	}
	
	//validate slider percent and make sure they add up to 100% or 0
	,validateSliderPercent: function() {
		this.s_valid = true;
		if(this.a_slider_percents) {
			var b_valid = false;
			Ext.each(this.a_slider_percents, function(item, index) {
				var i_value = 0;
				Ext.each(item, function(iitem) {
					i_value += parseInt(Ext.getDom(iitem).value);
				});
				if(this.o_slider_id[index] && i_value < 100) {
					this.s_valid = false;
					return false;
				}
				else if(i_value != 100 && i_value != 0) {
					this.s_valid = false;
					return false;
				}
				b_valid = true;
			}, this);
			return b_valid;
		}
		else
			return true;
	}
	
	,view: function(el){
		// debug
		
		if(!Ext.isIE)
			console.info(this);
		
		// set title of the dialog
		this.dlg.setTitle(this.acty_type_nm);
		
		// reset the template for reuse
		//star.tpl_acty.reset();
		// object of data to fill the template
		this.o_template_data = {};
		
		// show task msg if necessary
		this.showTaskHeader();
		
		// show the basic details, name, etc.
		this.showDetails();
		
		// show all the questions and responses
		this.showQnA();
		
		// overwrite the body of the panel with the acty template
		star.tpl_acty.overwrite(el,this.o_template_data);
		
		// updates the change icons to toggle the changes divs
		this.showChanges(el);
		
		// set the buttons for this activity
		this.setButtons(el);
	}
} // end star.Activity.prototype

// Grid
star.Grid = function() {
	// array of options
	/* var a_opts = [
					'a_columns','a_fields','s_url','s_id_field','s_autoExpandColumn','b_enableColLock','b_enableDragDrop'
					,'o_baseParams','b_paging','b_remoteSort','o_sortInfo','b_loadMask','b_singleSelect'
					,'i_recs_per_page','b_page_displayInfo','s_page_displayMsg','s_page_emptyMsg','s_ddGroup','fn_beforeRender'
					,'b_enableColumnMove', 'b_editor'
				]; */
	// default options
	var o_dflt = {
					a_columns: [],b_paging:false,b_remoteSort:true,b_loadMask:true,b_singleSelect:true
					,b_page_displayInfo:true,s_page_displayMsg: 'items {0} - {1} of {2}'
					,s_page_emptyMsg: 'No items found'
					,b_enableDragDrop: false,s_ddGroup:'',fn_beforeRender:'',b_enableColumnMove: false
					,b_editor: false, b_stripeRows:true, b_numbered:true, b_autoLoad: true, o_store_listeners: {}
				};
	// For grids that employ pagination this is the number of records to 
	// show by default on each page
	o_dflt.i_recs_per_page = 25;
	
	return {
		
		// creates a grid
		// s_div is the div to place the grid into and
		// o_params are the parameters for creating the grid, see below for details
		// about the options that can be passed
		create: function(s_div,o_params) {
			/* params options are:
				a_columns: array of columns for the grid, for example:
					[
						{id:'acty_nm', header:"Activity Name", dataIndex:"acty_nm", width:350, sortable:true}, 
						{header:"Start Date", dataIndex:"acty_start_dt", width:100, sortable: true}, 
						{header: "Results", dataIndex:"num_rslt", width:65, sortable: true},
						{header: "Status",  dataIndex:"acty_sts", width:60, sortable: true}
					];
				a_fields: array of the fields for this grid. If not passed one will be constructed from a_columns.
				s_url: the url to get the data from
				b_enableDragDrop: whether or not to allow drag and drop of rows. Defaults to false
				,b_enableColumnMove: whether or not to allow columns to be draggable. Defaults to false
				fn_beforeRender: function to run before rendering grid
				s_ddGroup: group name for drag and drop. Only needed if b_enableDragDrop is set to true. Defaults to ''
				s_id_field: the field that holds the id for each record
				s_autoExpandColumn: id of the field to autoExpand
				o_baseParams: any parameters to be posted to the url whenever requests are made
				b_paging: Whether or not to do paging. Defaults to false.
				i_recs_per_page: Number of records to load per page when paging. Defaults to star.i_grid_recs_per_page
				b_remoteSort: Whether or not to sort the records on the server. Defaults to true.
				o_sortInfo: object indicating how to sort the records. For example: 
							{field:'acty_nm',direction:'ASC'}
				b_loadMask: Whether or not to use a loading mask in front of the grid when loading results
							defaults to true.
				b_singleSelect: whether or not to do single selection or multiple
				b_page_displayInfo: Whether or not to show the number or results info. Defaults to true.
				s_page_displayMsg: Message to display for the number of results. Example:
									'Displaying activities {0} - {1} of {2}'
				s_page_emptyMsg: Message to display when no results are found. Example:
								'No activities found'
				o_meta: meta data for json reader
				o_proxy: proxy for datastore
			*/
			
			// set default options
			var o_args = Ext.apply({},o_params,o_dflt);
			
			// keep local var of a_columns so that we don't change it since it's passed by reference
			if(o_args.a_columns){
				var a_cols = [];
				Ext.each(o_args.a_columns,function(item){
					a_cols.push(item);
				});
			}
			
			//if numbered
			if(o_args.b_numbered) {
				if(o_args.b_paging)
					a_cols.unshift(new Ext.grid.PagedRowNumberer());
				else
					a_cols.unshift(new Ext.grid.RowNumberer());
			}
			
			//define the column model
			var colModel = new Ext.grid.ColumnModel(a_cols);
			
			// selection model
			var selModel = new Ext.grid.RowSelectionModel({singleSelect:o_args.b_singleSelect});
			
			if(o_args.b_autoLoad) { // only necessary if we want the grid to load immediately
				var o_loadParams = {}; //params to post when loading the data
				if(o_args.b_paging)
					o_loadParams = {params:{start:0, limit:o_args.i_recs_per_page}};
			}
			
			// setup where the grid gets its data from if necessary
			var store;
			if(o_args.store)
				store = o_args.store;
			else {
				// create the array of fields if necessary from the column array
				if(!o_args.a_fields){
					o_args.a_fields = [];
					for(var i=0;i<a_cols.length;i++)
						o_args.a_fields[i] = a_cols[i].dataIndex;
				}
				
				//default proxy and meta data if none have been specified
				if(!o_args.o_proxy)
					o_args.o_proxy = new Ext.data.HttpProxy({url: o_args.s_url});
				if(!o_args.o_meta)
					o_args.o_meta = { root: 'st_data.results', totalProperty: 'st_data.i_total', id: o_args.s_id_field};
				
				store = new Ext.data.Store({
					proxy: o_args.o_proxy
					,reader: new Ext.data.JsonReader(o_args.o_meta, o_args.a_fields)
					,baseParams: o_args.o_baseParams
					,remoteSort: o_args.b_remoteSort
					,sortInfo: o_args.o_sortInfo
					,autoLoad: o_loadParams
					,listeners: o_args.o_store_listeners
				});
			}
			
			var bbar = null;
			
			// do paging if necessary
			if(o_args.b_paging) {
				bbar = new Ext.PagingToolbar({
					store: store
					,pageSize: o_args.i_recs_per_page
					,displayInfo: o_args.b_page_displayInfo
					,displayMsg: o_args.s_page_displayMsg
					,emptyMsg: o_args.s_page_emptyMsg
				});

				//store paging in here so it can be accessed later
				//grid.o_paging = paging;
				
				//when a row is added, update paging toolbar
				store.on("add", function() {
					this.totalLength++;
					bbar.updateInfo();
				});
				
				//when a row is removed, update paging toolbar
				store.on("remove", function() {
					this.totalLength--;
					bbar.updateInfo();
				});
				
			}
			
			//determine if editor grid or not
			var s_grid = "GridPanel";
			if(o_args.b_editor)
				s_grid = "EditorGridPanel";
			
			// call any function that needs to be called before rendering
			if(o_args.fn_beforeRender)
				o_args.fn_beforeRender();
				
			// setup params to pass to the grid
			var o_grid_params = {
				store: store
				,cm: colModel
				,selModel: selModel
				,clicksToEdit: 1
				,viewConfig: {
					forceFit:true
				}
				//,layout:'fit'
				,bbar: bbar
			};
			Ext.each(['s_autoExpandColumn', 'b_loadMask', 'b_enableDragDrop', 's_ddGroup'
						, 'b_enableColumnMove', 'b_stripeRows']
				,function(item){
					o_grid_params[item.substr(2)] = o_args[item];
				}
			);
			// add any extra params passed in that are not our specific arguments. We
			// know our arguments because they begin with something like o_ or b_ , etc.
			for (var k in o_params)
				if(k.length >= 2 && k.substr(1,1)!='_'){
					//console.log("adding param:"+k);
					o_grid_params[k] = o_params[k];
				}
					
			// create grid
			var grid = new Ext.grid[s_grid](o_grid_params);
			
			//grid.store.load.defer(1,grid.store,[o_loadParams]);
			/* grid.on('render',function(){
					console.log('rendering grid');
					this.store.load(o_loadParams);
				}
				,grid,{single:true}
			); */
			
			return grid;
			
		} // end star.Grid.create
		
		/* // destroys a grid
		,destroy: function(grid) {
			if(grid) {
				var s_div = grid.getGridEl().id;
				// destroy the grid
				grid.destroy();
				// remove the div that held the grid
				var g_div = Ext.get(s_div);
				if(g_div) {
					
					g_div.remove();
				}
			}
		} // end star.Grid.destroy */
		
		
	}; // end return for star.Grid
}(); // end star.Grid

star.MyTasks = function() {
	
	return {
		
		// changes the number of tasks displayed for my tasks link
		changeCount: function(i_tasks) {
			var task_el = Ext.get('crumb_tasks_num');
			var task_lnk = Ext.get('crumb_tasks');
			if(task_lnk) {
				// if the task badge is already showing then simply update it with the new num or remove it if we no longer have any tasks
				if(task_el)
					if(i_tasks)
						task_el.update(i_tasks);
					else
						task_el.remove();
				// if the task badge is not visible but we have a task then add it
				else if(i_tasks)
					$dh.insertAfter(task_lnk,{tag:'span', id:'crumb_tasks_num', cls:'sup', html:i_tasks});
				star.i_tasks = i_tasks;
			}
		} // end star.MyTasks.changeCount
		
		// creates the my tasks grid
		,initGrid: function() {
			var a_cols = [
				{id:'acty_nm', dataIndex:'acty_nm', header: "Task", width:200, sortable: true}, 
				{id:'acty_start_dt', dataIndex:'acty_start_dt', header: "Start Date", width:90, sortable: true
					,renderer:function(value, cell, record){
						if(value)
							return value.format(Date.patterns.short);
					}
				}, 
				{dataIndex:'days_in_queue', header: "Time in List", width:90, sortable: true
					,renderer:function(value, cell, record){
						var d_in_q = Math.round(value);
						var s_time = d_in_q + ' days';
						if(value < 1) {
							var i_diff = record.data['task_rqst_dt'] - new Date();
							if(i_diff > 120)
								s_time = Math.round(i_diff/60) + ' hours';
							else if(i_diff > 60)
								s_time = '1 hour';
							else if(i_diff > 1)
								s_time = i_diff + ' mins';
							else
								s_time = '< 1 min';
						} else {
							if(d_in_q == 1)
								s_time = d_in_q + ' day';
						}
						var s_class = '';
						if(d_in_q > 30)
							s_class = 'taskverylate';
						else if(d_in_q > 14)
							s_class = 'tasklate';
						
						return '<div class="'+s_class+'">'+ s_time + '</div>';
					}
				}, 
				{dataIndex:'acty_sts_sort_order_num', header: "Type", width:45, sortable: true
					,renderer:function(value, cell, record){
						return '<div class="centered"><img src="images/task/ico_task_'+value+'.jpg"'
							+ ' title="'+record.data['acty_sts_desc']+'" border="0" width="16" height="16" /></div>';
					}
				}
			];
			var a_flds = [
				{name:"acty_nm"}
				,{name:"acty_start_dt",type: 'date', dateFormat:Date.patterns.ISO8601Long}
				,{name:"days_in_queue"}
				,{name:"acty_sts_sort_order_num"}
				,{name:"acty_sts_desc"}
				,{name:"task_rqst_dt"}
			];
	
			var tbar = new Ext.Toolbar({cls:'header', items:['List of Tasks']});
			this.grid_tasks = star.Grid.create('grid_tasks', {
				a_columns: a_cols
				,a_fields: a_flds
				,s_url: star.Utils.buildUrl('component','task','getTasks') + '&b_getIcon=true'
				,s_id_field: 'acty_id'
				,s_autoExpandColumn: 'acty_nm'
				,o_baseParams: {}
				,o_sortInfo: {field:'days_in_queue',direction:'DESC'}
				,b_paging: false
				,b_page_displayInfo: false
				,b_remoteSort: false
				,cls:'grid-inner box'
				,tbar:tbar
				,loadMask:{msg:'Retrieving tasks ...'}
			});
			
			this.grid_tasks.on('rowclick',function(g,rowIndex,e){
				var selModel = this.getSelectionModel();
				var rec = selModel.getSelected();
				if(rec){ 
					//var anim_el = e.getTarget();
					var o_acty = new star.Activity(rec.id);
					o_acty.init();
				}
			});
		} // end star.MyTasks.createGrid
		
		// creates the my tasks window
		,initWindow: function(){
			this.task_dlg = new star.Window({
				id: 'task_dlg'
				,title: 'My Tasks'
				,width:650
				,height:400
				,minWidth:480
				,minHeight:300
				,listeners:{
					show:{
						fn:function(){
							// update the number of tasks whenever the grid is reloaded
							this.grid_tasks.store.on('load',function(){
								this.changeCount(this.grid_tasks.store.getTotalCount());
							},this);
						}
						,scope:this
						,single:true
					}
				}
				,layout:'fit'
				,items:{
					layout:'fit'
					,autoScroll:true
					,items:this.grid_tasks
				}
			});
		} // end star.MyTasks.createWindow
		
		// refreshes the My Tasks Grid
		,reloadGrid: function() {
			if(this.task_dlg){
				if(this.task_dlg.isVisible()){
					this.grid_tasks.store.load();
					return true;
				// if the grid is not visible then let's set it to refresh when it's shown
				} 
			}
			return false;
		} // end star.MyTasks.reloadGrid
		
		// opens the My Taks Dialog
		,show: function() {
			if(this.task_dlg) 
				this.grid_tasks.store.load(); // reload the task grid each time we show it
			// build the task dialog
			else {
				this.initGrid();
				this.initWindow();
			}
			
			this.task_dlg.show();
		} // end star.MyTasks.show
		
		,updateCount: function(i_tasks){
			// if dialog is already open then simply reload the my task grid. This will also cause the count to update
			if(!this.reloadGrid() && star.i_tasks != i_tasks)
				this.changeCount(i_tasks);
		} // end star.MyTasks.updateCount
		
	} // end return for star.MyTasks
	
}(); // end star.MyTasks

star.People = function(el) {
	//el would be the mini grid row that should be updated when a person is deleted or edited
	if(el)
		this.el_row = el;
	this.dlg = star.pplDialog;
};// end star.People

star.People.prototype = {
	//add email feature in initPerson screen
	addEmail: function() {
		var email = this.f_prsn.findField('prsn_email_address');
		var email_value = email.getValue();
		if(!email_value.length || !email.isValid())
			return;
		var tbody = $qn("tbody", "tab_prsn_email_address");
		var tr_rows = $q("tr", "tab_prsn_email_address");
		var cls = (Ext.get(tr_rows[tr_rows.length-1]).hasClass('alt')) ? '' : 'alt';
		
		//make sure we are not repeating emails. if email address is found in the table, don't add another row
		var hid_addresses = this.f_prsn.findField('prsn_hid_addresses');
		var a_hid = hid_addresses.getValue().split(",");
		if(a_hid.indexOf(email_value) != -1)
			return;
		
		//create row
		var tr = $dh.append(tbody, {tag:'tr', cls: cls, 
			children: [
				{tag:'td', title:email_value, html:email_value, cls:'ellipsis' },
				{tag:'td', align:'center', html:'<input type="checkbox" name="f_rad_primary" '
									+ 'title="Check this if this is the person\'s primary email address" />'},
				{tag:'td', align:'center', html:'<a href="##" class="ico_remove" title="Remove ' + email_value + '"></a>'}
			]	
		});
		
		//add onclick event to remove icon
		Ext.EventManager.on(Ext.get(tr).child('a.ico_remove'), "click", 
			function(e, o) { this.removeEmail(o); }, 
			this, 
			{stopEvent:true}
		);
		
		//add onclick to primary radio
		Ext.EventManager.on(Ext.get(tr).child('input[type=checkbox]'), "click", function(e, o) {
			this.updatePrimary(o);
		}, this);
		
		//add email address
		a_hid.push(email_value);
		hid_addresses.setValue(a_hid.join(","));
		
		//clear email address from email field
		email.setValue("");
	}
	
	// checks to make sure the user entered a valid email based on the domains passed from the server
	,checkEmailDomain: function(email){
		return this.st_emaildomains[email.split('@')[1]];
	}
	
	// checks passwords to make sure they meet the required criteria
	,checkPassword: function(s_pswd) {
		if (s_pswd.length < 8
				|| s_pswd.length > 50
				|| /\s/.test(s_pswd) // no spaces
				|| !/[a-z]/.test(s_pswd) // at least 1 lower case character
				|| !/[A-Z]/.test(s_pswd) // at least 1 upper case character
				|| !/\d/.test(s_pswd) // at least 1 digit
				|| !/[\W_]/.test(s_pswd) // at least 1 special character
		){
			return 'Password must meet the following requirements:<br />'
						  +'- Must be at least 8 characters<br />'
						  +'- Cannot contain spaces<br />'
						  +'- Must contain at least one number<br />'
						  +'- Must contain at least one lower case character<br />'
						  +'- Must contain at least one upper case character<br />'
						  +'- Must contain at least one special character \(!,@,#,^, ...\)';
		} else
			return 'success';
	}
	
	//create new user/person
	,createPerson: function(s_type, el, o_size, o_act) {
		var othis = this;
		
		if(o_act)
			this.o_act = o_act;
		
		var i_width = 0;
		var i_height = 0;
		if(o_size) {
			i_width = o_size.i_width;
			i_height = o_size.i_height;
		}
		this.dlg.build({
			s_title:'New ' + s_type + ' ...'
			,activeTab: 'tab_person_create'
			,i_height: i_height
			,i_width: i_width
			,a_tabs: [
				{
					s_name: 'tab_person_create'
					,s_title: 'Person'
					,fn_init: function() {
						//var mgr = dlg.o_panels.tab_person_create.bodyPanel.getEl().getUpdateManager();
						var mgr = this.body.getUpdateManager();
						mgr.setRenderer(
							{
								render: function(el,response){
									var o_data = Ext.decode(response.responseText);
									if(o_data.s_status == 'success') {
										//set title
										othis.dlg.setTitle('Creating ' + s_type);
										//set body
										el.update(o_data.st_data.s_body);
										//copy vars to the person
										for(var k in o_data.st_data)
											if(k != 's_body')
												othis[k] = o_data.st_data[k];
										othis.initPerson();
										//create buttons
										var a_btns = [
											{
												s_name: 'btn_ppl_create',
												ctCls: 'btn-force',
												tooltip: 'Create '+s_type,
												icon: 'images/add.png',
												text: 'Create',
												handler: function() { othis.savePerson(s_type); }
											}
										];
										//set the buttons
										othis.dlg.setButtons('tab_person_create', a_btns);
									}
									//for(var k in o_data.st_data)
										//this.scope[k] = o_data.st_data[k];
								}
								, scope: this
							}
						);
						mgr.update({
							url: star.Utils.buildUrl('component','people','initPerson') + '&s_type=' + s_type,
							text: 'loading person form',
							scripts: false
						});
					}
				}
			]
		});
		this.dlg.show();
	}
	
	//perform action on person (init, save or delete)
	,deletePerson: function(id) {
		//delete person
		//Ext.MessageBox.getDialog().getEl().addClass('t-brown');
		Ext.MessageBox.confirm('Confirm', 'Are you sure you want to delete this person?', 
			function(s_btn) {
				if(s_btn == "yes") {
					if(typeof id == "undefined") id = "";
					var s_nm = Ext.get('prsn_frst_nm').getValue() + ' ' + Ext.get('prsn_last_nm').getValue();
					var o_params = {
						s_resourceType: 'component'
						,s_resource: 'people'
						,s_method: 'deletePerson'
						,prsn_id: Ext.get('prsn_id').getValue()
						,s_nm: s_nm
						,usr_id: (Ext.get('usr_id')) ? Ext.get('usr_id').getValue() : ''
						,rnd: new Date().getTime()
					}
					
					Ext.MessageBox.wait('Deleting user...', 'Please wait...');
					
					$conn.request({
						params: o_params,
						callback: function(options,b_success,response) {
							if(b_success) {
								var o_response = Ext.decode(response.responseText);
								var o_data =  o_response.st_data;
								if(o_data.b_success) {
									this.dlg.hide();
									//if grid mini row el is defined, then update the grid mini
									if(this.el_row) {
										var el_value = $qn('a.ico_remove', this.el_row);
										var el_hidden = el_value.getAttribute('idhidden');
										var value = el_value.getAttribute("value");
										var el_hidden_values = Ext.getDom(el_hidden);
										var a_hidden_values = el_hidden_values.value.split(",");
										var a_hidden_new = [];
										Ext.each(a_hidden_values, function(item) {
											if(item != value)
												a_hidden_new.push(item);
										});
										el_hidden_values.value = a_hidden_new.join(",");
										Ext.get(this.el_row).remove();
									}
									if(o_data.b_reloadapp)
										Ext.MessageBox.alert('Successfull Delete','You just deleted your own user account.'
											+' You will now be signed out.'
											,function(){
												star.Utils.goHome();
											}
										);
									else {
										if(star.Section.s_curr_sect == "people")
											star.Section.sections["people"].refreshGrid(true);
										Ext.MessageBox.alert('Status', s_nm + ' has been deleted successfully');
									}
								}
								else
									Ext.MessageBox.alert('The user ' + s_nm + ' could not be deleted');
							}
						},
						failure: function() {
							Ext.MessageBox.alert('The user ' + s_nm + ' could not be deleted');
						},
						scope: this
					});
				}
			}, this
		);
	}
	
	//edit person
	,editPerson: function(id) {
		var tabs = this.dlg.getTabs();
		var othis = this;
		var o_tab = {
			s_name: 'tab_person_edit'
			,s_title: 'Edit Person'
			,fn_init: function() {
				var s_type = Ext.get('s_type').getValue();
				// update body of the tab with the edit form
				var mgr = this.body.getUpdateManager();
				mgr.setRenderer(
					{
						render: function(el,response){
							var o_data = Ext.decode(response.responseText);
							if(o_data.s_status == 'success') {
								//set title
								othis.dlg.setTitle('Viewing Person');
								//set body
								el.update(o_data.st_data.s_body);
								//copy vars to the person
								for(var k in o_data.st_data)
									if(k != 's_body')
										othis[k] = o_data.st_data[k];
								
								// remove the view tab, this will remove the fields therein so that they don't interfere with the edit form
								othis.dlg.getTabs().remove('tab_person_view',true);
								// build the person edit form
								othis.initPerson();
								//create buttons
								var a_btns = [
									{
										s_name: 'btn_ppl_save',
										ctCls: 'btn-force',
										tooltip: 'Save',
										icon: 'images/ico_but_save.gif',
										text: 'Save',
										handler: function() { othis.savePerson(s_type, id); }
									}
								];
								//set the buttons
								othis.dlg.setButtons('tab_person_edit', a_btns);
							}
						}
						, scope: this
					}
				);
				mgr.update({
					url: star.Utils.buildUrl('component','people','initPerson') + '&prsn_id=' + id 
							+ '&s_type=' + s_type,
					text: 'loading person',
					scripts: false
				});
			}
		}
		this.dlg.addTab(o_tab, tabs);
		tabs.hideTabStripItem('tab_person_view');
		tabs.activate('tab_person_edit');
	}
	
	,editUser2Activate: function(id) {
		this.dlg.build({
			s_title:'Activate Your User Account'
		});
		
		//this.dlg.setTitle('Activate Your User Account');
		var othis = this;
		
		this.dlg.on("show", function() {
			var mgr = this.body.getUpdateManager();
			mgr.setRenderer(
				{
					render: function(el,response){
						var o_data = Ext.decode(response.responseText);
						if(o_data.st_data.s_status == "error") {
							Ext.MessageBox.alert('User already activated','This user account has already been activated'
								,function(){this.dlg.hide();}, othis);
							return;
						}
						if(o_data.s_status == 'success') {
							//set body
							el.update(o_data.st_data.s_body);
							//var col_width = Ext.get(Ext.DomQuery.select('.col', 'f_prsn_init')[0]).getWidth();
							var dlg = this.scope;
							// keep tack of email domains for validation
							othis.st_emaildomains = o_data.st_data.st_emaildomains;
							// create the form panel
							var frm_activate = new Ext.form.FormPanel({
								layout:'form'
								,cls:'box'
								,defaultType:'textfield'
								,autoScroll:true
								,bbar:['->',{ctCls: 'btn-force', tooltip: 'Continue', icon: 'images/ico_but_save.gif', text: 'Continue'
										,scope:this
										,handler:function() { othis.saveUser2Authenticate(id); }
									}
								]
								,items:[
									{xtype:'panel', contentEl:'f_activateUser'}
									// hidden fields
									,{applyTo:'usr_id'}
									,{applyTo:'prsn_id'}
									,{applyTo:'usr_login_id'}
									// first name
									,{allowBlank:false, anchor:'50%', msgTarget:'under', applyTo:'prsn_frst_nm'}
									// middle name
									,{anchor:'50%', msgTarget:'under', applyTo:'prsn_midl_nm'}
									// last name
									,{allowBlank:false, anchor:'50%', msgTarget:'under', applyTo:'prsn_last_nm'}
									// email
									,{allowBlank:false, vtype:'email', anchor:'50%', msgTarget:'under', applyTo:'usr_email_txt'}
									// phone number
									,{anchor:'50%', msgTarget:'under', applyTo:'usr_phone_num'}
									// password name
									,{allowBlank:false, inputType:'password', anchor:'50%', msgTarget:'under', applyTo:'usr_pswd_txt'}
									// confirm password
									,{allowBlank:false, inputType:'password', anchor:'50%', msgTarget:'under', applyTo:'usr_pswd_txt2'}
								]
							})
							// add the form panel to the window
							dlg.add(frm_activate);
							othis.frm_activate = frm_activate.getForm();
							dlg.doLayout();
							
							// make so that if the user changes their email address the username output also changes
							Ext.get('usr_email_txt').on('keyup',function(e){
									Ext.get('usr_login_id').dom.value = Ext.get('username_show').dom.innerHTML = Ext.get('usr_email_txt').dom.value;
								}
							);
							// focus password field
							Ext.get('usr_pswd_txt').focus();
						}
					}
					, scope: this
				}
			);
			mgr.update({
				url: star.Utils.buildUrl('component','security','getUser2Activate') + '&usr_id=' + id
				,text: 'loading your account'
				,scripts: false
			});
		});
		
		
		// redirect home if the dialog is hidden
		this.dlg.on("hide", function() {
			star.Utils.goHome();
		}, this);
		
		this.dlg.show();
	}
	
	,initPerson: function() {
		//get column width
		//var col_width = Ext.get(Ext.DomQuery.select('.col', 'f_prsn_init')[0]).getWidth();
		
		//create array of form fields
		this.a_flds = [];
		
		// turn on validation errors beside the field globally
		//Ext.form.Field.prototype.msgTarget = 'under';
		
		var a_inputs = $q('input,select,textarea','f_prsn_init');
		
		Ext.each(a_inputs, function(o) {
			//transformed the select, but this causes the combobox to stay at 1 place even when dialog is scrolled (IE only)
			//TODO: find a way to fix this annoying problem in IE
			/*
			if(o.type == "select-one") {
				f_prsn.add(
					new Ext.form.ComboBox({
						emptyText: o.getAttribute('instr'),
						typeAhead: true,
						mode: 'local',
						triggerAction: 'all',
						transform: o.name,
						width: col_width,
						forceSelection: true
					})
				);
			}
			else
			*/
			//make sure options for checkbox have no width
			var o_options = (o.type == "checkbox") ? {name:o.name} : {anchor:'50%', name:o.name};
			//make sure textboxes are added as TextFields (this is necessary for the validation to work)
			var field_type = (o.type == "text") ? "textfield" : "field";

			if(o.name != "f_rad_primary" && o.name != 'l_role_ids') {
				if(o.name == "prsn_email_address") {
					//add email textfield
					var f_email = new Ext.form.TextField(
						{anchor:'48%',name:o.name,disableKeyFilter:true,vtype:'email', applyTo:o.name}
					);
					f_email.on("specialkey", 
						function(o, e) {
							//if enter key is pressed, add email
							if(e.getKey()==13)
								this.addEmail(); 
					}, this);
					this.a_flds.push(f_email);
					//add email button
					var btn_email = new Ext.Button({
						renderTo:'btn_email',
						cls: 'btn-no-icon',
						text: 'Add',
						handler:  this.addEmail,
						tooltip: 'Add Email Address',
						scope: this
					});
					//fix annoying IE problem where textbox jumps when ext component is applied to it
					if(Ext.isIE) {
						if(o.name != "prsn_email_address")
							Ext.get(o.name).setStyle('margin-top', -1);
						else
							Ext.get(o.name).setStyle('margin-top', 0);
					}
				}
				else {
					//required
					if(o.getAttribute('required')) {
						o_options.allowBlank = false;
						o_options.msgTarget = 'under';
					}
					//if multiple select box, get each value and store in an array
					if(o.type == "select-multiple") {
						o_options.value = [];
						Ext.each(o.options, function(s_i) {
							if(s_i.selected)
								o_options.value.push(s_i.value);
						});
					}
					o_options.applyTo = o;
					o_options.xtype = field_type;
					//add to the list of fields
					this.a_flds.push(o_options);
					
				}
			}
		}, this);
		
		//create form panel
		this.a_flds.unshift({contentEl:'prsn_frm'});
		var f_prsn = new Ext.form.FormPanel({
			layout:'form',
			autoScroll:true,
			items:this.a_flds 
		});
		var tab = this.dlg.getTabs().getActiveTab();
		tab.add(f_prsn);
		tab.doLayout();
		this.f_prsn = f_prsn.getForm();
		
		//assign click events to the remove icons
		Ext.each(Ext.DomQuery.select('a.ico_remove', 'tab_prsn_email_address'), function(o) {
			Ext.EventManager.on(o, "click", function() { 
				this.removeEmail(o);
			}, this, {stopEvent:true});
		}, this);
		
		//add event for adding primary emails
		Ext.each($q("input[type=checkbox]", "tab_prsn_email_address"),
			function(o) {
				Ext.EventManager.on(o, "click", function() {
					this.updatePrimary(o);
				}, this);
			}, this
		);
		
		//when msg when submitting form
		this.f_prsn.on("beforeaction", function(f, a) {
			//Ext.MessageBox.getDialog().getEl().addClass('t-brown');
			Ext.MessageBox.wait('Saving user...', 'Please wait...');
		});
	}
	
	//remove email
	,removeEmail: function(el) {
	
		Ext.MessageBox.confirm('Confirm', 'Are you sure you want to remove this email address?', 
			function(s_btn) {
				if(s_btn == "yes") {
					var parent = Ext.get(el).findParent("tr");
					var email_value = $qn("td:first-child", parent).innerHTML;
					
					//remove from hidden addresses field
					var a_hid = this.f_prsn.findField('prsn_hid_addresses').getValue().split(",");
					a_hid.remove(email_value);
					this.f_prsn.findField('prsn_hid_addresses').setValue(a_hid.join(","));
					
					//remove from primary address field if it's there
					if(email_value == this.f_prsn.findField('prsn_hid_primary').getValue())
						this.f_prsn.findField('prsn_hid_primary').setValue("");
					
					//remove row
					Ext.get(parent).remove();
					
					//refresh row classes
					var tr_rows = Ext.DomQuery.select("tr", "tab_prsn_email_address");
					tr_rows.slice(1); //get rid of the first row (that's the header, we don't need that)
					Ext.each(tr_rows, function(o, i) {
						var row = Ext.get(o);
						if(row.hasClass('alt'))
							row.removeClass('alt');
						if(i % 2 == 0)
							row.addClass('alt');
					});
				}
			}
			,this
		);
		
	}
	
	// reset password
	,resetPassword: function(reset_code) {
		this.dlg.setTitle('Reset Your Password');
		
		var othis = this;
		
		this.dlg.on("show", function() {
			var mgr = this.body.getUpdateManager();
			mgr.setRenderer(
				{
					render: function(el,response){
						var o_data = Ext.decode(response.responseText);
						if(o_data.st_data.s_status == "error") {
							Ext.MessageBox.alert('Error','A reset password request was not made for this account or has already been performed'
								,function(){this.dlg.hide();}, othis);
							return;
						}
						if(o_data.s_status == 'success') {
							var dlg = this.scope;
							// create the form panel
							var frm_resetPassword = new Ext.form.FormPanel({
								layout:'form'
								,cls:'box'
								,defaultType:'textfield'
								,defaults:{ msgTarget:'under', labelSeparator:'' }
								,autoScroll:true
								,bodyStyle:'padding:10px'
								,bbar:['->',{ctCls: 'btn-force', tooltip: 'Continue', icon: 'images/ico_but_save.gif', text: 'Continue'
										,scope:this
										,handler:function() { othis.saveNewPassword(o_data.st_data.usr_id); }
									}
								]
								,items:[
									// instructions
									{xtype:'panel', html:'Name: <span class="bold">'+o_data.st_data.prsn_nm+'</span><br />'
													+ 'Username: <span class="bold">'+o_data.st_data.usr_login_id+'</span><br />'
													+ '<br />'
													+ 'Please choose a password and click Continue<br /><br />'}
									,{xtype:'hidden', name:'usr_id', value:o_data.st_data.usr_id}
									// password name
									,{allowBlank:false, inputType:'password', anchor:'-40', id:'usr_pswd_txt', name:'usr_pswd_txt'
										,fieldLabel:'Password', blankText:'Please enter your new password'
										,listeners:{
											'specialkey': function(o, e){
												if(e.getKey() == e.ENTER)
													othis.saveNewPassword(o_data.st_data.usr_id);
											} 
										}
									}
									// confirm password
									,{allowBlank:false, inputType:'password', anchor:'-40', id:'usr_pswd_txt2', name:'usr_pswd_txt2'
										,fieldLabel:'Confirm Password', blankText:'Please confirm the password entered'
										,listeners:{
											'specialkey': function(o, e){
												if(e.getKey() == e.ENTER)
													othis.saveNewPassword(o_data.st_data.usr_id);
											} 
										}
									}
								]
							})
							// add the form panel to the window
							dlg.add(frm_resetPassword);
							othis.frm_resetPassword = frm_resetPassword.getForm();
							dlg.doLayout();
							
							// focus password field
							Ext.get('usr_pswd_txt').focus();
						}
					}
					, scope: this
				}
			);
			mgr.update({
				url: star.Utils.buildUrl('component','security','getUser2Reset') + '&reset_code=' + reset_code
				,text: 'loading your account'
				,scripts: false
			});
		});
		
		
		// redirect home if the dialog is hidden
		this.dlg.on("hide", function() {
			star.Utils.goHome();
		}, this);
		
		this.dlg.show();
	}
	
	// save new password
	,saveNewPassword: function() {
		//Ext.MessageBox.minWidth = '360';
		// validation before saving
		if(!this.frm_resetPassword.isValid())
			return;
		
		// capture all errors
		var a_errors = []; 
		if(this.frm_resetPassword.findField('usr_pswd_txt').getValue() != this.frm_resetPassword.findField('usr_pswd_txt2').getValue()) {
			a_errors.push('The passwords you entered do not match each other');
			this.frm_resetPassword.findField('usr_pswd_txt').setValue('');
			this.frm_resetPassword.findField('usr_pswd_txt2').setValue('');
		} else {
			var s_pswd = this.frm_resetPassword.findField('usr_pswd_txt').getValue();
			var s_pswd_msg = this.checkPassword(s_pswd);
			if(s_pswd_msg != 'success'){
				a_errors.push(s_pswd_msg);
				this.frm_resetPassword.findField('usr_pswd_txt').setValue('');
				this.frm_resetPassword.findField('usr_pswd_txt2').setValue('');
			}
		}
				
		// if no errors then submit
		if(!a_errors.length){
			Ext.MessageBox.wait('Resetting Your Password ...','Please Wait');
			this.frm_resetPassword.submit({
				url: star.Utils.buildUrl('component','security','resetPassword')
				,success: function(f, a) {
					if(a.result.s_status == "success") {
						if(a.result.st_data.s_status && a.result.st_data.s_status != 'success')
							Ext.MessageBox.alert('Error',a.result.st_data.s_msg);
						else
							Ext.MessageBox.alert('Success','Your password was successfully reset! click ok to enter MAT'
								,function(){
									this.dlg.hide();
								}
								,this
							);
					} else {
						Ext.MessageBox.hide();
						Ext.MessageBox.alert('Error',a.result.s_msg,function(){
								this.frm_resetPassword.findField('usr_pswd_txt').focus();
							}
						);
					}
				}
				,failure: function(f, a){
					Ext.MessageBox.alert('Error', 'Could not reset your password');
				}
				,scope: this
			});
		// show errors
		}else{
			if(a_errors.length > 1)
				var s_msg = 'The following problems were found, please correct them and try again<br /><br /><ul>';
			else
				var s_msg = 'The following problem was found, please correct it and try again<br /><br /><ul>';			
			for(var i=0;i<a_errors.length;i++)
				s_msg += '<li>' + a_errors[i] + '</li>';
			s_msg += '</ul>';
			Ext.MessageBox.alert('Error', s_msg, function(){this.frm_resetPassword.findField('usr_pswd_txt').focus();},this);
		}
	}
	
	//save person
	,savePerson: function(s_type, id, b_role) {
		if(this.f_prsn.isValid()) {
			//submit form
			//id = id ? id : "";
			
			//if coming from an activity and creating a person, then bring up role message box
			if(this.o_act && !b_role) {
				Ext.MessageBox.show({
					title:'Please choose a role',
					msg: this.o_act.s_msg_roles,
					buttons: Ext.MessageBox.OKCANCEL,
					scope:this,
					fn: function(b) {
						if(b=="ok") {
							var sel = Ext.getDom('prsn_role_select');
							var role_index = this.o_act.st_prsn_roles.st_roles[sel.value.toLowerCase()] - 1;
							var sel_text = this.o_act.st_prsn_roles.a_roles[role_index].prsn_role_desc;
							this.o_act.sel_text = sel_text;
							this.o_act.sel_value = sel.value;
							this.savePerson(s_type, id, true);
						}
						else {
							this.o_act.sel_text = "";
							this.o_act.sel_value = "";
						}
					}
				});	
				return;
			}
			
			if(this.b_validatestaff){
				var a_roles = $q('input[name=l_role_ids]','f_prsn_init');
								
				if(!a_roles.length){
					Ext.MessageBox.alert('Error'
						,'You do not appear to have sufficient privileges to edit this user. Please contact the MAT support team');
					return;
				}
				// users must have a primary email address
				if(!this.f_prsn.findField('prsn_hid_primary').getValue().length){
					Ext.MessageBox.alert('Error','User must have a primary email address assigned'
						,function(){
							this.f_prsn.findField('prsn_email_address').focus();
						}
						,this
					);
					return;
				}
				// make sure the domain of the email is valid
				if(!this.checkEmailDomain(this.f_prsn.findField('prsn_hid_primary').getValue())){
					Ext.MessageBox.alert('Error','Email address must be a valid Department of State address'
						,function(){
							this.f_prsn.findField('prsn_email_address').focus();
						}
						,this
					);
					return;
				}
				// users must have a role assigned
				var b_role_assigned = false;
				for(var k in a_roles)
					if(a_roles[k].checked == true){
						b_role_assigned = true;
						break;
					}
				if(!b_role_assigned){
					Ext.MessageBox.alert('Error'
						,'You must assign at least one role to this user');
					return;
				}
			}
			
			if(!this.o_act || (this.o_act && b_role)) {
				this.f_prsn.submit({
					url: star.Utils.buildUrl('component','people','savePerson'),
					success: function(f, a) {
						if(a.result.s_status == "success") {
							if(a.result.st_data.s_status && a.result.st_data.s_status != 'success')
								Ext.MessageBox.alert('Error',a.result.st_data.s_error);
							else {
								this.dlg.hide();
								//if grid mini row, then update mini grid
								if(this.el_row) {
									var a_last_nm = $qn('a', this.el_row);
									a_last_nm.innerHTML = this.f_prsn.findField('prsn_last_nm').getValue(); //Ext.get('prsn_last_nm').getValue();
									var a_first_nm = $qn('a:nth(2)', this.el_row);
									a_first_nm.innerHTML = this.f_prsn.findField('prsn_frst_nm').getValue(); //Ext.get('prsn_frst_nm').getValue();
								}
								else if(this.o_act && this.o_act.el_minibody && this.o_act.sel_value) {
									var a_fields = [
										{tag:'td', title:this.f_prsn.findField('prsn_last_nm').getValue(), html:this.f_prsn.findField('prsn_last_nm').getValue()},
										{tag:'td', title:this.f_prsn.findField('prsn_frst_nm').getValue(), html:this.f_prsn.findField('prsn_frst_nm').getValue()},
										{tag:'td', title:this.o_act.sel_text, html:this.o_act.sel_text}
									];
		
									this.o_act.uiGridMini_add(a_fields, this.o_act.el_minibody, a.result.st_data.prsn_id + '_' + this.o_act.sel_value);
								}
								if(a.result.st_data.b_reloadapp)
									Ext.MessageBox.alert('Successfully Saved','You just edited your own user account.'
										+' The application will now refresh in order to reflect any changes made.'
										,function(){
											star.Utils.redirect($sect.s_curr_sect);
										}
									);
								else {
									Ext.MessageBox.alert('Saved', s_type + ' was saved successfully!');
									if($sect.s_curr_sect == 'people')
										$sect.sections[$sect.s_curr_sect].reloadGrid();
								}
							}
						}
						else {
							if(star.Section.s_curr_sect == "people")
								star.Section.sections["people"].refreshGrid(true);
							Ext.MessageBox.alert('Error', 'There was an error saving this user');
						}
					},
					failure: function(f, a) {
						Ext.MessageBox.alert('Error', 'There was an error saving this user');
					},
					scope: this
				});
			}
		}
		else
			Ext.MessageBox.alert('Error', 'Please check that you have filled in all required fields');
	}
	
	// save the user account that is being authenticated
	,saveUser2Authenticate: function(id) {
		//Ext.MessageBox.minWidth = '360';
		// validation before saving
		if(!this.frm_activate.isValid()){
			Ext.MessageBox.alert('Error', 'Please check that you have filled in all required fields');
			return;
		}
		
		var a_errors = [];
		if (!this.checkEmailDomain(this.frm_activate.findField('usr_email_txt').getValue()))
			a_errors.push('Email address must be a valid Department of State address');

		if(this.frm_activate.findField('usr_pswd_txt').getValue() != this.frm_activate.findField('usr_pswd_txt2').getValue()) {
			a_errors.push('The passwords you entered do not match each other');
			this.frm_activate.findField('usr_pswd_txt').setValue('');
			this.frm_activate.findField('usr_pswd_txt2').setValue('');
		} else {
			var s_pswd = this.frm_activate.findField('usr_pswd_txt').getValue();
			var s_pswd_msg = this.checkPassword(s_pswd);
			if(s_pswd_msg != 'success'){
				a_errors.push(s_pswd_msg);
				this.frm_activate.findField('usr_pswd_txt').setValue('');
				this.frm_activate.findField('usr_pswd_txt2').setValue('');
			}
		}
				
		// if no errors then submit
		if(!a_errors.length){
			Ext.MessageBox.wait('Activating your account ...','Please Wait');
			this.frm_activate.submit({
				url: star.Utils.buildUrl('component','security','activateUser')
				,success: function(f, a) {
					if(a.result.s_status == "success") {
						if(a.result.st_data.s_status && a.result.st_data.s_status != 'success')
							Ext.MessageBox.alert('Error',a.result.st_data.s_msg);
						else
							Ext.MessageBox.alert('Success','Your account was successfully activated, click ok to enter MAT'
								,function(){
									this.dlg.hide();
								}
								,this
							);
					} else {
						Ext.MessageBox.hide();
						Ext.MessageBox.alert('Error',a.result.s_msg,function(){
								this.frm_activate.findField('usr_login_id').focus();
							}
						);
					}
				}
				,failure: function(f, a){
					Ext.MessageBox.alert('Error', 'Could not activate user account');
				}
				,scope: this
			});
		// show errors
		}else{
			if(a_errors.length > 1)
				var s_msg = 'The following problems were found, please correct them and try again<br /><br /><ul>';
			else
				var s_msg = 'The following problem was found, please correct it and try again<br /><br /><ul>';			
			for(var i=0;i<a_errors.length;i++)
				s_msg += '<li>' + a_errors[i] + '</li>';
			s_msg += '</ul>';
			Ext.MessageBox.alert('Error', s_msg, function(){this.frm_activate.findField('usr_pswd_txt').focus();},this);
		}
	}
	
	//update primary email
	,updatePrimary: function(el) {
		var parent = Ext.get(el).findParent("tr");
		var email = $qn("td:first-child", parent);
		var primary_email = this.f_prsn.findField('prsn_hid_primary');
		if(email.innerHTML != primary_email.getValue()) {
			//remove previous primary email row class
			var old_primary;
			if(old_primary = $qn("td.bold", "tab_prsn_email_address")){
				var old_parent = Ext.get(old_primary).findParent('tr');
				Ext.get(old_primary).removeClass("bold");
				var old_checkbox = Ext.get(old_parent).child('input[type=checkbox]');
				old_checkbox.dom.checked = false;
			}
			//set new primary email and add class
			primary_email.setValue(email.innerHTML);
			Ext.get(email).addClass('bold');
		// unset primary email
		} else {
			//remove from primary address field if it's there
			this.f_prsn.findField('prsn_hid_primary').setValue("");
			// remove email row class
			Ext.get(email).removeClass('bold');
		}
	}
	
	//view person 
	,viewPerson: function(id, el, o_size) {
		var i_width = 0;
		var i_height = 0;
		if(o_size) {
			i_width = o_size.i_width;
			i_height = o_size.i_height;
		}
		
		var o = {
			s_txt_title: "Viewing Person",
			s_txt_loading_title: "Retrieving Person ...",
			s_url: star.Utils.buildUrl('component','people','viewPerson') + '&prsn_id=' + id,
			s_txt_loading_body: "loading person ..."
		};
		//var a_panels
		//$sect.sections[s_sect].buildDialog(o, el);
		var othis = this;
		this.dlg.build({
			s_title:'Retrieving Person ...'
			,activeTab: 'tab_person_view'
			,i_height: i_height
			,i_width: i_width
			,a_tabs: [
				{
					s_name: 'tab_person_view'
					,s_title: 'Person'
					,fn_init: function() {
						//var mgr = dlg.o_panels.tab_person_view.bodyPanel.getEl().getUpdateManager();
						var mgr = this.body.getUpdateManager();
						mgr.setRenderer(
							{
								render: function(el,response){
									var o_data = Ext.decode(response.responseText);
									if(o_data.s_status == 'success') {
										//set title
										othis.dlg.setTitle('Viewing Person');
										//set body
										el.update(o_data.st_data.s_body);
										//create buttons
										var a_btns = [];
										Ext.each(o_data.st_data.a_btns, function(o) {
											if(o.s_pos_id == "deletePerson")
												var fn = function() { othis.deletePerson(id); }
											else if(o.s_pos_id == "editPerson")
												var fn = function() { 
													//dlg.getLayout().showPanel(dlg.o_panels.tab_person_edit.outerLayout); 
													//dlg.getTabs().activate('tab_person_edit');
													this.editPerson(id);
												}
											a_btns.push({
												s_name: o.s_btn_id,
												ctCls: 'btn-force',
												tooltip: o.s_txt,
												icon: o.s_icon,
												text: o.s_txt,
												handler: fn,
												scope:othis
											});
											
										}, this);
										//set the buttons
										othis.dlg.setButtons('tab_person_view', a_btns);
									}
									//for(var k in o_data.st_data)
										//this.scope[k] = o_data.st_data[k];
								}
								, scope: this
							}
						);
						mgr.update({
							url: star.Utils.buildUrl('component','people','viewPerson') + '&prsn_id=' + id,
							text: 'loading person',
							scripts: false
						});
					}
				}
			]
		});
		this.dlg.show();
	}
}//end star.people

star.Section = function() {
	
	// vars available within star.Section
	var s_body_id = 'bodymain';
	var b_header_created = false;
	var b_dialogs_created = false;
	var a_sects = [];
		
	return {

		s_curr_sect: '' // currently loaded section
		,s_last_sect: '' // last loaded section
		,sections: {} // associative array of pages loaded
		,mainLayout: '' // layout used for the application
		//,tabs:'' // stores the section tab panel
		
		//applies view and switches interface with view
		,applyView: function(o_item) {

			Ext.MessageBox.wait('Loading ' + o_item.text + '...','Please wait');
			
			var s_conn = $conn.request({
				params: {
					s_resourceType: 'component'
					,s_resource: 'security'
					,s_method: 'applyView'
					,s_section: $sect.s_curr_sect
					,s_id: o_item.id
					,s_view: o_item.group
					,s_label: o_item.text
					,s_flag: o_item.s_icon
					,rnd: new Date().getTime()
				}
				,callback: function(options,b_success,response){
					if(b_success) {
						var o_response = Ext.decode(response.responseText);
						var o_data =  o_response.st_data;
						if(o_data.s_data == "success") {
							var s_redir = $sect.s_curr_sect;
							if(o_data.redir != undefined && o_data.redir != "")
								s_redir = o_data.redir;
							document.location.href = document.location.href.split('#')[0]+'?redir='+s_redir;
						}
					}
				}
			});
		}
		
		,createInfoDialog: function(){
			//add info listener
			Ext.EventManager.on('crumb_info','click'
				,function(){
					var createIssueForm = function(){
						var blk = this.body;
						//blk.className = 'hidden';
						blk.update('\
							<div class="dpadded">\
								<h1>Report an Issue</h1>\
								<p>An issue may be reported to the Mission Activity Tracker support team by \
								contacting the IRM InfoCenter at 202-647-7760 or by submitting your issue \
								via the form below.  Both methods of reporting will result in the creation \
								of a UTT Ticket that will track your issue throughout the resolution \
								process.  If a UTT Ticket has not been created for your submission, \
								please immediately notify the IRM InfoCenter.</p>\
								<div class="alert">Please note that all fields are required</div>\
								<div id="frm_issue"></div>\
							</div>');
						//document.body.appendChild(blk);
						
						var s_width = '98%';
						/* if(Ext.isIE)
							s_width = '95%'; */
						
						new Ext.form.FormPanel({
							labelAlign: 'top',
							labelSeparator: '',
							labelWidth: 75,
							renderTo:'frm_issue',
							id:'f_issueform',
							items:[
								{
									xtype:'textarea',
									fieldLabel: 'Error Received (if applicable)',
									name: 'f_error_received',
									width:s_width,
									height:'120',
									allowBlank: false
								}
								,{
									xtype:'textarea',
									fieldLabel: 'Issue Description',
									name: 'f_desc',
									width:s_width,
									height:'120',
									allowBlank: false
								}
								,{
									xtype:'textarea',
									fieldLabel: 'Steps to Reproduce Issue',
									name: 'f_steps',
									width:s_width,
									height:'120',
									allowBlank: false
								}
								,{
									xtype:'textarea',
									fieldLabel: 'Result',
									name: 'f_result',
									width:s_width,
									height:'120',
									allowBlank: false
								}
								,{
									xtype:'textarea',
									fieldLabel: 'Frequency of Issue',
									name: 'f_frequency',
									width:s_width,
									height:'120',
									allowBlank: false
								}
							]
						});
						
						// add send button
						dlg.setButtons('tab_issue',[
								{
									s_name: 'btn_issue_send'
									,ctCls: 'btn-force'
									,tooltip:'Send Issue Report'
									,text:'Send'
									,icon:'images/ico_but_email_go.gif'
									,handler: function() { 
										var f_issueform = Ext.getCmp('f_issueform').getForm();
										if(f_issueform.isValid()) {
											var o_params = {
												s_resourceType: 'component'
												,s_resource: 'utils'
												,s_method: 'sendEmail'
												,template: 'sendContact'
												,rnd: new Date().getTime()
											}
											var o_values = Ext.urlDecode(Ext.Ajax.serializeForm(f_issueform.id));
											Ext.apply(o_values, o_params);
											
											$conn.request({
												params: o_values
												,callback: function(options,b_success,response){
													if(b_success) {
														Ext.MessageBox.alert('Sent', 'Your message has been sent');
														star.miscDialog.hide();
													}
												}
											});
										}
										else
											Ext.MessageBox.alert('Error', 'Please make sure you have filled in all fields');
									}
								}
							]
						);
						
					}; // end createIssueForm()
					
					var dlg = star.miscDialog;
					var fn_init = function(s_letter, s_panel, tab) {
						//var mgr = dlg.getTabs().getTab(s_panel).getUpdateManager();
						var mgr = tab.body.getUpdateManager();
						mgr.setRenderer(
							{
								render: function(el,response){
									var o_data = Ext.decode(response.responseText);
									if(o_data.s_status == 'success') {										
										//set body
										el.update('<div class="padded">' + o_data.st_data + '</div>');
									}
								}
								, scope: this
							}
						);
						mgr.update({
							url: star.Utils.buildUrl('component','message','getMessage',true) + '&s_key=' + s_letter,
							text: 'loading...',
							scripts: false
						});
					}
					dlg.build({
						s_title:'MAT Information'
						,activeTab:'tab_about'
						,cls:'t-purple'
						,a_tabs: [
							{
								s_name: 'tab_about',
								s_title: 'About',
								s_body: 'About',
								fn_init: function(tab) { fn_init('A', 'tab_about', tab); }
							},
							{
								s_name: 'tab_issue',
								s_title: 'Issue Form',
								s_body: '',
								fn_init: createIssueForm
							},
							{
								s_name: 'tab_faq',
								s_title: 'FAQ',
								s_body: 'FAQ',
								fn_init: function(tab) { fn_init('F', 'tab_faq', tab); }
							}
						]
					});
					dlg.show();
					dlg.center();
				}
				,this
				,{stopEvent:true}
			);
		} // end createInforDialog
		
		,createLocationDialog: function(o_item) {
			var s_loc = o_item.text.split(' ')[0];
			// use the miscDialog 
			var dlg = star.miscDialog;
			if(!dlg.isVisible()) {
				/* dlg.setClassName('t-purple');
				dlg.setSize(dlg.minWidth,dlg.minHeight);
				dlg.setTitle(s_loc); */
				dlg.build({
					s_title:s_loc
					,cls:'t-purple'
					,i_width:dlg.minWidth
					,i_height:dlg.minHeight
				})
				dlg.show();
				dlg.center();
				/* // remove the body of the window on hide 
				dlg.on("beforehide", function() {
					this.removeContents();
				}, dlg, {single:true}); */
			}
			var grid_loc;
			// function that goes to the location selected in the grid
			var goLocation = function() {
				var selModel = grid_loc.getSelectionModel();
				var rec = selModel.getSelected();
				if(rec){ 
					$sect.applyView({
						id: rec.id
						,group: o_item.location
						,text: rec.data.nm
						,s_icon: (rec.data.cntry_fips_cd) ? 'images/world/'+rec.data.cntry_fips_cd.toLowerCase()+'.png' : ''
					});
				}
			};
			// function to filter grid by search text
			var searchLocations = function() {
				if(Ext.getCmp('f_loc_filter').getValue().length)
					grid_loc.store.filter('nm',Ext.getCmp('f_loc_filter').getValue(),true,false);
				else
					grid_loc.store.clearFilter();
			};
			
			// build grid
			var	a_cols = [{id:'nm', header:"Name", dataIndex:"nm", sortable:true}];
			var b_remoteSort = false;
			if(o_item.location != 'regions') {
				// flag
				a_cols.unshift({id:'cntry_fips_cd', header:"Flag", dataIndex:"cntry_fips_cd", width:20
					,renderer:function(value, cell, record){
						if(value && Ext.type(value)=='string')
							return '<img src="images/world/'+value.toLowerCase()+'.png" title="'+value+'">';
						else
							return '';
					}
				});
				if(o_item.location == 'posts')
					a_cols.push({id:'cntry_nm', header:"Country", dataIndex:"cntry_nm", sortable:true, width:60});
				a_cols.push({id:'regn_nm', header:"Region", dataIndex:"regn_nm", sortable:true, width:60});
			}
			// build menu for switching between regions, countries and posts sections
			var a_m = ['regions','countries','posts'];
			var a_titles = ['Region ...','Country ...','Post ...'];
			var a_items = [{text:'Global', checked:false, location:'Global', group:'location_win'
				,handler:function(o) {
					$sect.applyView({
						id: ''
						,group: 'global'
						,text: o.text
						,s_icon: ''
					});
				}
			}];
			for(var i=0;i<a_m.length;i++){
				if(o_item.location != a_m[i])
					a_items.push({text:a_titles[i], checked:false, location:a_m[i], group:'location_win'
						,handler: function(o_men) {
							dlg.body.mask('Please Wait');
							dlg.removeContents();
							$sect.createLocationDialog(o_men);
						}
					});
				else
					var s_loc_2 = a_titles[i].split(' ')[0];
			}
			grid_loc = star.Grid.create('grid_location', {
				a_columns: a_cols
				,o_meta: {root: 'st_data.a_results', id: 'id'}
				,o_proxy: new Ext.data.HttpProxy({url: star.Utils.buildUrl('component','ui','makeViewMenu',true)
													+ '&s_type=' + o_item.location})
				,s_id_field: 'id'
				,s_autoExpandColumn: 'nm'
				,o_baseParams: {}
				,o_sortInfo: {field:'nm',direction:'ASC'}
				,b_paging: false
				,b_page_displayInfo: false
				,b_remoteSort: b_remoteSort
				,loadMask:{msg:'Retrieving ' + s_loc + ' ...'}
				,cls:'grid-inner box'
				,tbar:new Ext.Toolbar({cls:'header', id:'view_menu_inner', items:[
					'Please select a&nbsp;&nbsp;'
					,{text:s_loc_2, cls:'btn-no-icon', menu:{items:a_items}}
					,'->'
					,{xtype:'textfield', emptyText:'Search', id:'f_loc_filter', allowBlank:true}
					,' '
				]})
				,bbar:['->',{icon:'images/ico_but_save.gif', ctCls:'btn-force', text:'Go', id:'btn_loc', handler:goLocation}]
			});
			// add grid events
			grid_loc.on({
				'rowdblclick': goLocation
				,'keypress': function(e, targ, o) {
					var k = e.getKey();
					var s_k = String.fromCharCode(k);
					if(k == e.ENTER)
						this.fireEvent('rowdblclick');
					// allow for moving up and down the grid using the first letter of the names
					else if(/[A-Za-z]/.test(s_k)) { // make sure it is an alpha character being pressed
						var selModel = this.getSelectionModel();
						var rec = selModel.getSelected();
						if(rec){
							s_k = s_k.toLowerCase();
							var s_rec_key = rec.data.nm.substr(0,1).toLowerCase();
							var i_rec = -1;
							// let's go down from the currently selected record to find the next record matching the key pressed
							for(var i=selModel.last+1;i<this.store.data.items.length;i++) {
								if(this.store.data.items[i].data.nm.substr(0,1).toLowerCase() == s_k) {
									i_rec = i;
									break;
								}
							}
							// if we did not find a record matching the key pressed by going down, then let's start from the top
							if(i_rec < 0)
								for(var i=0;i<selModel.last;i++) {
									if(this.store.data.items[i].data.nm.substr(0,1).toLowerCase() == s_k) {
										i_rec = i;
										break;
									}
								}
							// if a record was found then let's select it
							if(i_rec >= 0) {
								// select the record
								selModel.selectRow(i_rec);
								// scroll the row into view
								var grid_body = $qn('div.x-grid3-body',this.body.dom);
								var row_el = $qn('div:nth-child('+(i_rec)+')',grid_body);
								var body_scroll = $qn('div.x-grid3-scroller',this.body.dom);
								Ext.get(body_scroll).scrollTo('top',row_el.offsetTop,true);
							}
						}
					}
				} // end keypress event
			});
			// add event to select the first row
			grid_loc.store.on('load',function(s){
				if(s.data.items.length) {
					grid_loc.getView().focusRow(0);
					grid_loc.getSelectionModel().selectRow(0);
				}
			});
			
			if(dlg.body.isMasked())
				grid_loc.on('render',dlg.body.unmask,dlg.body,{single:true});
			
			// add grid to the window
			dlg.add(grid_loc);
			dlg.doLayout();
			
			// add filtering event
			Ext.getCmp('f_loc_filter').getEl().on('keyup',searchLocations);
		} // end createLocationDialog
		
		,createLocationMenu: function() {
			
			// create view menu button
			var btn_vm = new Ext.Button({
				text: star.st_view.s_label,
				renderTo:'view_menu',
				menu: {
					id:'v_menu',
					renderTo:'view_menu',
					items:  [
						{text:'Global', group:'location', checked:(star.st_view.s_view=='global')
							, handler:function(o_item){
								$sect.applyView({
									id: ''
									,group: 'global'
									,text: o_item.text
									,s_icon: ''
								});
							}
						}
						,{text:'Regions ...', group:'location', location:'regions', checked:(star.st_view.s_view=='regions'), handler:this.createLocationDialog}
						,{text:'Countries ...', group:'location', location:'countries', checked:(star.st_view.s_view=='countries'), handler:this.createLocationDialog}
						,{text:'Posts ...', group:'location', location:'posts', checked:(star.st_view.s_view=='posts'), handler:this.createLocationDialog}
					]
				},
				icon: star.st_view.s_icon,
				scope:this
			});
			
			return;

		} // end createLocationMenu
		
		,createTrainingDialog: function(lnk) {
			Ext.EventManager.on(lnk,'click'
				,function() {
					//star.train_dlg.body.update('<iframe src="training/index.html" style="width:780px; height:600px; border:0;" frameborder="0"></iframe>');
					// open training window
					var win_train = window.open('training/index.html'
						,'win_training'
						,'menubar=no,location=no,status=no,resizable=yes,width=780,height=600'
					);
					win_train.focus();
				}
				,this
				,{stopEvent:true}
			);
		} // end createTrainingDialog
		
		,dialogs: function() {
			if(!b_dialogs_created) {
				var obj = {
					width:600,
					height:400,
					minWidth:500,
					minHeight:400
				}
				
				star.mainDialog = new star.Window(Ext.apply(obj,{id:'mainDialog'}));
				star.pplDialog = new star.Window(Ext.apply(obj,{id:'pplDialog'}));
				star.subDialog = new star.Window(Ext.apply(obj,{id:'subDialog'}));
				//star.taskDialog = new star.Window(Ext.apply(obj,{id:'taskDialog'}));
				star.miscDialog = new star.Window(Ext.apply(obj,{id:'miscDialog'}));
				
				b_dialogs_created = true;
			}
		}
		
		// inserts the header into the document if necessary
		,header: function() {
		
			if(!b_header_created && this.s_curr_sect != 'signIn'){
				var prsn_nm = star.st_user.prsn_frst_nm+' '+star.st_user.prsn_last_nm;
				var s_last_sign = '';
				if(star.st_user.usr_last_login_dt.length) {
					// 2007-07-10 19:08:00.0
					var d_full = Date.parseDate(star.st_user.usr_last_login_dt,Date.patterns.ISO8601Long);
					var d_last = d_full.format(Date.patterns.full);
					s_last_sign = ', You last signed in ' + d_last;
				}
				var st_hdr = {prsn_nm:prsn_nm, s_last_sign:s_last_sign, i_tasks:star.i_tasks};
				var a_nav = [];
				// insert nav into the header template
				for (var i=0;i<star.st_view.a_sections.length;i++) {
					// add section to nav
					a_nav.push({
					    s_sect: star.st_view.a_sections[i].replace(/\s/,'','g')
						,s_sect_nm: star.st_view.a_sections[i]
					});
				}
				st_hdr.a_nav = a_nav;
				// insert header template
				star.tpl_header.overwrite(this.mainHeader.body,st_hdr);
				this.mainHeader.show();
				this.viewPort.doLayout(); // update the viewport layout
				
				// attach nav events
				for (var i=0;i<a_nav.length;i++) {
					// add listener
					var s_navItem = 'nav_'+a_nav[i].s_sect;
					Ext.EventManager.on(s_navItem,'click',function(){
						var s_sect = this.id.split('_')[1];
						if(s_sect != $sect.s_section)
							$sect.show(s_sect);
					},Ext.get(s_navItem),{stopEvent:true});
				}
				// add sign out listener
				Ext.EventManager.on('signOut','click'
					,function(){
						star.Security.signOut();
					}
					,{}
					,{stopEvent:true,single:true}
				);
				
				// build location menu
				this.createLocationMenu();
				
				b_header_created = true;
				
				this.dialogs();
				
				this.createInfoDialog();
				
				//tasks dialog
				if(Ext.get('crumb_tasks'))
					Ext.EventManager.on('crumb_tasks','click', star.MyTasks.show,star.MyTasks,{stopEvent:true});
				
				//training dialog
				this.createTrainingDialog('crumb_training');
				
			} // end if(!b_header_created && this.s_curr_sect != 'signIn')
		} // end header method
		
		// function to update the header nav to show where we are
		,headerNavUpdate: function() {
			if(b_header_created){
				// highlight the link for the current section
				if(this.s_last_sect.length && this.s_last_sect != 'signIn' && Ext.get('nav_'+this.s_last_sect).hasClass('selected')){
					var oldSelected = Ext.get('nav_' + this.s_last_sect);
					var s_old_nm = Ext.get('lnk_' + this.s_last_sect).dom.innerHTML;
					oldSelected.dom.title = "Go to " + s_old_nm + ' section';
					oldSelected.removeClass('selected');
				}
				var selected = Ext.get('nav_'+this.s_curr_sect);
				if(!selected.hasClass('selected')) {
					var s_curr_nm = Ext.get('lnk_' + this.s_curr_sect).dom.innerHTML;
					selected.dom.title = "You are here: " + s_curr_nm;
					selected.addClass('selected');
				}
			} // end if(!b_header_created && this.s_curr_sect != 'signIn')
		} // end headerNavUpdate method
		
		// builds the layout for the page
		,layout: function() {
			if(this.mainLayout == ''){
				this.viewPort = new Ext.Viewport({
					layout:'border'
					,id:'mat-main'
					,hideBorders:true
					,items: [
						{
							region: 'north'
							,id:'mainHeader'
							,xtype: 'panel'
							,autoHeight:true
							//,layout: 'card'
							,defaults:{border:false}
							,hidden:true
						}
						,{
							region: 'center'
							,id:'mainLayout'
							//,xtype: 'panel'
							,layout: 'card'
							,defaults:{border:false}
						}
					]
				});
				this.mainHeader = Ext.getCmp('mainHeader');
				//this.mainHeader.body.setHeight('100%');
				this.mainLayout = Ext.getCmp('mainLayout');
				/*var o_center = document.createElement('div');
				o_center.id = 'sec_center';
				o_center.className = 'x-layout-inactive-content';
				o_center.innerHTML = '<div id="section_tabs"></div>';
				document.body.appendChild(o_center);*/
				//build layout
				/* this.mainLayout = new Ext.BorderLayout(document.body, {
					center: {
						split:false
						,hideTabs:true
					}
					,lightweight:true
				}); */
				//this.mainLayout.add('center', new Ext.ContentPanel('sec_center', {fitToFrame:true}));
				//this.tabs = new Ext.TabPanel('section_tabs');
			}
			
			/*
			//build center section
			//var o_center = document.createElement('div');
			//o_center.id = "sec_center";
			//o_center.className = "x-layout-inactive-content padded";
			//document.body.insertBefore(o_center,document.body.firstChild);
			
			//build layout
			this.mainLayout = new Ext.BorderLayout(document.body, {
				north: {
					split:false
				},
				center: {
					split:false
				}
			});
			
			this.mainLayout.beginUpdate();
			//this.mainLayout.add('north', new Ext.ContentPanel('sec_header', {fitToFrame:true}));
			//this.mainLayout.add('center', new Ext.ContentPanel('sec_center', {fitToFrame:true}));
			this.mainLayout.endUpdate(); */
		}
		
		// manages the cache of sections in browser
		,manageCache: function(){
			var s_sect = this.s_curr_sect;
			var s_last = this.s_last_sect;
			var i_num_sects_2_cache = star.i_num_sects_2_cache;
						
			if(i_num_sects_2_cache) {
				/* logic for caching:
					if current section is not in cache then add it
						if there is not enough room in the cache then bump the oldest entry
					else
						move current section to the top of the queue
				*/
				// check to see if current section is in the cache queue
				var b_in_list = false;
				for(var i=0;i<a_sects.length;i++)
					if(a_sects[i] == s_sect) {
						b_in_list = true;
						break;
					}
				// if current section is not in cache then add it
				if(!b_in_list){
					var i_pos = a_sects.length;
					// if there is not enough room in the cache then bump the oldest entry i.e. the first one
					if(a_sects.length == (i_num_sects_2_cache+1)){
						i_pos --;
						var s_bump_sect = a_sects[0];
						for(var i=1;i<a_sects.length;i++)
							a_sects[i-1] = a_sects[i];
						
						// run destroy on the section
						if(this.sections[s_bump_sect].destroy)
							this.sections[s_bump_sect].destroy();
						
						delete this.sections[s_bump_sect];
						// remove the oldest panel
						this.mainLayout.remove('section_'+s_bump_sect,true);
					}
					// add item to the list
					a_sects[i_pos] = s_sect;
				// if it's already in the queue then move it to the top of the queue
				} else
					for(var i=a_sects.length-2;i>-1;i--)
						if(a_sects[i] == s_sect){
							for(var j=i;j<a_sects.length-1;j++)
								a_sects[j] = a_sects[j+1];
							
							a_sects[a_sects.length-1] = s_sect;
							break;
						}
			
			// if we are not caching then remove the last section if there was one
			} else if(s_last.length && Ext.get('section_'+s_last)){
				// run destroy on the section
				if(this.sections[s_last].destroy)
					this.sections[s_last].destroy();
				
				delete this.sections[s_last];
				// remove the last panel
				this.mainLayout.remove('section_'+s_last,true);
			}
			
		}
		
		// check to see a session already exists for the current user
		,show: function(s_sect,s_body) {
			//alert('showing sect: '+s_sect);
			// for sign-in section if url is not blank then redirect
			if(s_sect == 'signIn' && star.Utils.getAnchor().length) {
				star.Utils.goHome();
				return;
			}
			// update the vars keeping track of the sections
			if(s_sect != this.s_curr_sect) {
				var s_prev_last_sect = this.s_last_sect;
				this.s_last_sect = this.s_curr_sect;
				this.s_curr_sect = s_sect;
			// if this section is already being shown then do nothing
			} else
				return;
			
			// setup the layout
			this.layout();
			// insert header
			this.header();
			
			// if section is already loaded we just need to show it
			if(this.sections[s_sect]) {
				this.switchSections(false);
				//this.viewPort.doLayout();
			// otherwise load the section from the server
			} else {
				// add new panel
				var s_id = 'section_' + s_sect;
				/* //var new_panel = this.tabs.addTab(s_id, s_sect);
				//this.tabs.activate(s_id);
				// Ext.get(s_body_id).dom.innerHTML = Ext.get(s_body_id).dom.innerHTML
				//							+ '<div id="'+s_id+'" style="display:none"></div>';
				var o_new = document.createElement('div');
				o_new.id = s_id;
				o_new.className = 'x-layout-inactive-content';
				//document.body.appendChild(o_new);
				this.mainLayout.getEl().appendChild(o_new);
				var layout = new Ext.BorderLayout(s_id, {});
				var new_panel = new Ext.NestedLayoutPanel(layout, {
					autoCreate:true
					,title:s_sect
					,fitToFrame:true
				});
				this.mainLayout.add('center', new_panel); */
				//return;
				var new_panel = this.mainLayout.add({
					id:s_id
					//,html:'loading...'
					,layout:'fit'
				});
				//console.log(new_panel);
				// activate panel
				this.mainLayout.layout.setActiveItem(s_id);

				this.viewPort.getEl().mask(' loading ' + s_sect + ' ...'); // mask the section
				
				// if the HTML was passed in for this section then put it in place
				// otherwise load it from the server
				if(typeof s_body != 'undefined') {
					/* new_panel.getEl().update(s_body,true,
						function(){
							// make sure we pass in $sect in the this scope, also tell it this is a new section
							$sect.switchSections.apply($sect,[true]);
						}
					); */
					new_panel.body.update(s_body,true,
						function(){
							// make sure we pass in $sect in the this scope, also tell it this is a new section
							$sect.switchSections.apply($sect,[true]);
						}
					);
										
				} else {
					var cb_getSection = function(o_el, b_success, o_response) {
						//alert('o_el:'+o_el+' b_success:'+b_success+' o_response'+o_response);
						if(b_success) {
							this.switchSections(true);
						} else {
							// remove new tab if there was an error
							this.mainLayout.remove('center','section_'+this.s_curr_sect);
							//this.tabs.removeTab('section_'+this.s_curr_sect);
							// reset section pointers
							this.s_curr_sect = this.s_last_sect;
							this.s_last_sect = s_prev_last_sect;
							//this.tabs.activate('section_'+this.s_curr_sect);
							this.mainLayout.showPanel(this.s_curr_sect);
						}
					}; // end cb_getSection callback object
					
					var s_url = star.Utils.buildUrl('file','sections/' + s_sect + '.cfm',false,false);
					new_panel.body.load({
						url: s_url
						,scripts: true
						,callback: cb_getSection
						,scope: star.Section
						,text: ' loading ' + s_sect + ' ...'
					});
				}
			} // end if (this.sections[s_sect])

		} // end show method
		
		// hides one section and shows another
		,switchSections: function(b_new_sect) {
			
			//update header nav to reflect where we are
			this.headerNavUpdate();
			
			var s_sect = this.s_curr_sect;
			var s_last = this.s_last_sect;
			var s_id = 'section_' + s_sect;
			
			//alert('wait');
			// hide previous section if there was one and hide method exists
			if(s_last.length && this.sections[s_last].hide)
				this.sections[s_last].hide();

			// manage cache
			this.manageCache();

			// if section does not exist then set it to an empty object
			if(!this.sections[s_sect]) 
				this.sections[s_sect] = {};

			// if not a new section then simply show the region containing the requested section
			if(b_new_sect){
				// initialize the section if that method exists
				if(this.sections[s_sect].init)
					this.sections[s_sect].init();
				// now call the show on the section if it exists
				
				// if no panel was created then make one
				//if(!this.mainLayout.getRegion('center').getPanel(s_div))
				//	this.mainLayout.add('center', new Ext.ContentPanel(s_div, {title: s_sect, fitToFrame:true}));
			} else
				// activate panel
				this.mainLayout.layout.setActiveItem(s_id);
			
			// call the show method for the current section
			if(this.sections[s_sect].show)
				this.sections[s_sect].show(); // now show the section

			this.viewPort.getEl().unmask(); //unmask the window
			
			/* // update the url to show the new section
			var s_anchor = star.Utils.getAnchor();
			//alert('current anchor:-'+s_anchor+'- requested sect:-'+s_sect+'-');
			if(s_sect != 'signIn' && s_anchor != s_sect)
				star.Utils.setAnchor(s_sect); */
				
		} // end star.Section.switchSections method
		
	}; // end return for star.Section
	
}(); // end star.Section

// Security functions
star.Security = function() {
	
	return {
		
		// checks to see if we are activating a user and if so shows the necessary screens
		activateUser: function() {
			// check to see if the newUser var was passed in the URL
			var o_vars = star.Utils.getURLVars();
			if(o_vars['newUser'] && o_vars['newUser'].length){
				var prsn_id = o_vars['newUser'];
				// create dialog
				var obj = {
					id:Ext.id(),
					width:600,
					height:600,
					minWidth:400,
					minHeight:400,
					cls:'t-brown'
					/* ,bbar:['->',{ctCls: 'btn-force', tooltip: 'Continue', icon: 'images/ico_but_save.gif', text: 'Continue'
							,scope:this
							,handler:function() { othis.saveUser2Authenticate(id); }
						}
					] */
				}
				star.pplDialog = new star.Window(obj);
				// show activate user
				var o_user = new star.People();
				o_user.editUser2Activate(prsn_id);
				
				return true;
			}
			
			return false;
		} // end star.Security.activateUser
		
		,getCurrentUser: function() {
			var s_anchor = star.Utils.getAnchor();
			// make a call to server to figure out if the user has a session and determine
			// what to show the user based on that. If no session then the sign-in page will
			// be returned
			var t_id = $conn.request({
				params: {
					s_resourceType: 'component'
					,s_resource: 'security'
					,s_method: 'getCurrentUser'
					,s_section: s_anchor
					,rnd: new Date().getTime()
				}
				,callback: function(options,b_success,response){
					if(b_success) {
						var o_data = Ext.decode(response.responseText);
						// if the user timeout then let them know
						//alert('-'+o_data.st_data.s_section + '-' + s_anchor+'-');
						//if(o_data.st_data.s_section == 'signIn' && s_anchor != o_data.st_data.s_section)
							/*Ext.Msg.alert('Session Timeout',
								'There has not been any activity in over <strong>1 hour</strong>' +
								' and so your session has timed out. Please sign in again'
								,function(){alert('clicked OK');}
							);*/
						// then update the url
						// if the section returned is not signIn then we know the user is 
						// already authenticated so let's setup their session
						if(o_data.st_data.s_section != 'signIn')
							star.Security.setSession(o_data.st_data);
						// show the section
						$sect.show(o_data.st_data.s_section,o_data.st_data.s_body);
					}
				}
			});
		} // end star.Security.getCurrentUser
		
		// reset user password
		,resetPassword: function() {
			// check to see if the resetPassword var was passed in the URL
			var o_vars = star.Utils.getURLVars();
			if(o_vars['passwordReset'] && o_vars['passwordReset'].length){
				var reset_code = o_vars['passwordReset'];
				// create dialog
				var obj = {
					id:Ext.id(),
					width:450,
					height:350,
					minWidth:400,
					minHeight:300,
					cls:'t-brown'
					/* ,bbar:['->',{ctCls: 'btn-force', tooltip: 'Continue', icon: 'images/ico_but_save.gif', text: 'Continue'
							,scope:this
							,handler:function() { othis.saveUser2Authenticate(id); }
						}
					] */
				}
				star.pplDialog = new star.Window(obj);
				// do reset password
				var o_user = new star.People();
				o_user.resetPassword(reset_code);
				
				return true;
			}
			
			return false;
		} // end star.Security.resetPassword
		
		,setSession: function(st_data) {
			var o_skip = {'s_body': 1, s_section: 1};
				for(var k in st_data)
					if (!o_skip[k])
						star[k] = st_data[k];
		} // end star.Security.setSession
		
		// signs the current user out
		,signOut: function() {
			//Ext.MessageBox.getDialog().getEl().addClass('t-brown');
			Ext.MessageBox.wait('Signing out ...','Please wait');
			/* waitTimer = Ext.TaskMgr.start({
				run: function(i){
					Ext.MessageBox.updateProgress(((((i+20)%20)+1)*5)*.01);
				},
				interval: 200
			}); */
			
			var t_id = $conn.request({
				params: {
					s_resourceType: 'component'
					,s_resource: 'security'
					,s_method: 'signOut'
					,rnd: new Date().getTime()
				}
				,callback: function(options,b_success,response){
					if(b_success) {
						Ext.MessageBox.updateProgress(1);
						//Ext.MessageBox.hide();
						star.Utils.goHome();
					}
				}
			});
		} // end signOut method
		
	}; // end return for star.Security
}(); // end star.Security

// Session functions
star.Session = function() {
	
	return {
		
		keepAlive: function(){
			star.Session.resetTimer();
			star.Session.pingServer();
		} // end star.Session.keepAlive
		
		,pingServer: function(){
			$conn.request({
				params: {
					s_resourceType: 'component'
					,s_resource: 'utils'
					,s_method: 'ping'
					,rnd: new Date().getTime()
				}
			});
		} // end star.Session.pingServer
		
		,resetTimer: function(){
			if(this.timer) {
				clearTimeout(this.timer);
				clearInterval(this.interval);
			}
			if(star.Section.s_curr_sect.length && star.Section.s_curr_sect != 'signIn'){
				this.i_timeout = Math.round((star.i_sessionTimeout - star.i_sessionWarning) * 60000);
				this.timer = setTimeout(
					function(){
						// Give user chance to keep their session alive
						Ext.MessageBox.alert('Session Timing Out'
							, 'Your session is about to end. Click OK to resume your session and continue working<br /><br />'
							+ '<div align="center" id="timeout_counter" class="bold"></div>'
							,star.Session.keepAlive
						);
						// update the countdown
						star.Session.interval = setInterval(
							function(){
								var s_pfx = '';
								var i_mins = 0;
								var i_timeout = star.Session.i_timeout -= 1000;
								//star.Session.i_timeout-= 1000;
								if(i_timeout < 60000){
									i_timeout /= 1000;
									s_unit = 'seconds'
								} else {
									var i_rem = i_timeout/60000;
									i_mins = Math.floor(i_rem);
									var s_unit = 'minutes';
									if(i_mins == 1)
										s_unit = 'minute';
									s_pfx = i_mins + ' ' + s_unit + ' ';
									i_timeout = Math.round(((i_rem - i_mins)*60000)/1000);
								}
								var s_unit = 'seconds';
								if(i_timeout == 1)
									s_unit = 'second';
								Ext.get('timeout_counter').update(s_pfx + i_timeout + ' ' + s_unit + ' remaining');
								// when timer is done then boot user from system
								if(star.Session.i_timeout == 0){
									clearTimeout(star.Session.interval);
									//Ext.MessageBox.hide();
									Ext.MessageBox.alert('Session Timed Out'
										, 'There has not been any activity in over <strong>1 hour</strong>'
										+ ' and so your session has timed out. Please sign in again'
										,star.Utils.goHome
									);
								}
							},1000
						);
					},star.i_sessionWarning * 60000
				);
			}
		} // end star.Session.resetTimer
		
	} // end return for star.Session
	
}(); // end star.Session

// utility functions
star.Utils = function() {
	
	return {
		
		/* buildUrl - centralizes creating urls to the app. takes the following:
		 	required parameters
				1. resourceType (component or file 
				2. resource (path to file or name of component)
			optional parameters
				1. method (name of method) required if requesting a method of a component
				2. b_JSON, whether or not to json encode the data returned 
		*/
		buildUrl: function(s_rt,s_r,s_m,b_JSON) {
			var s_url = star.s_url + '?s_resourceType='+s_rt+'&s_resource='+s_r;
			if(s_m)
				s_url +='&s_method='+s_m;
			if(typeof b_JSON != 'undefined')
				s_url += '&b_JSONParse=' + b_JSON;
			s_url += '&rnd=' + new Date().getTime();
			
			return s_url;
			
		} // end star.Utils.buildUrl
		
		// function to get the named anchor from the url
		,getAnchor: function() {
			var s_anchor = document.location.hash;
			if(s_anchor.length)
				s_anchor = s_anchor.split('#')[1];
			return s_anchor;
		}
		
		// retrieves variables being passed in the URL query string, so after the '?'
		,getURLVars: function() {
			var o_vars = {};
			var a_qs = document.location.href.split('?');
			if(a_qs.length > 1) {
				var a_vars = a_qs[1].split('&');
				for(var i=0;i<a_vars.length;i++){
					var a_var = a_vars[i].split('=');
					if(a_var.length > 1)
						o_vars[a_var[0]] = a_var[1];
				}
			}
			return o_vars;
		}
		
		// goes to the root page of the site
		,goHome: function(){
			document.location.href = document.location.href.split('#')[0].split('?')[0];
		}
		
		// function to reload browser, going to a specific section
		,redirect: function(s_sect){
			document.location.href = document.location.href.split('#')[0].split('?')[0]+'?redir='+s_sect;
		}
		
		// function to set the anchor
		,setAnchor: function(s_hash) {
			document.location.hash = '#' + s_hash;
			//document.location.href = document.location.href.split('#')[0] + '#'+s_hash;
			//var s_hash_old = '#'+$sect.s_last_sect;
			//alert(s_hash_old+'-'+document.location.hash+'-'+s_hash);
			//document.location.hash.replace(s_hash_old,'#'+s_hash);
			//document.location.href = '#' + s_hash;
			//window.location = '#' + s_hash;
			return false;
		}
		
		// function that creates the various templates used
		,setTemplates: function(){
			
			star.tpl_header = new Ext.XTemplate(
				'<div id="sec_header">'
					,'<a href="#content"><img src="images/spacer.gif" width="1" height="0" alt="Skip Navigation"></a>'
					,'<div id="header"><div id="logo"></div></div>'
					,'<div id="bar">'
						,'<ul id="nav" class="fleft">'
							,'<tpl for="a_nav">'
								,'<li id="nav_{s_sect}" title="Go to {s_sect_nm} section">'
									,'<a href="#{s_sect}" id="lnk_{s_sect}">{s_sect_nm}</a>'
								,'</li>'
							,'</tpl>'
						,'</ul>'
						,'<div id="view" class="fleft alignright"><div id="view_container" style="float:right">'
							,'<div id="view_menu"></div>'
						,'</div></div>'
					,'</div>'
					,'<div id="bar_shadow"></div>'
					,'<div id="crumb">'
						,'<div class="fleft" id="crumbfirst">Welcome, {prsn_nm:ellipsis(16)}{s_last_sign}</div>'
						,'<div class="fleft alignright" id="crumbother">'
							,'<tpl if="star.b_in_own_post">'
								,'<span><a id="crumb_tasks" href="#" title="Open Your Tasks">My Tasks</a>{[values.i_tasks ? "<span id=\'crumb_tasks_num\' class=\'sup\'>"+values.i_tasks+"</span>" : ""]}</span> | '
							,'</tpl>'
							,'<span><a id="crumb_training" href="training/index.html" target="_blank" title="Open Training Window">Training</a></span>'
							,' | <span><a id="crumb_info" href="#" title="Open Info Window">Info</a></span>'
							,' | <span><a id="signOut" href="#" title="Sign Out">Sign out</a></span>'
						,'</div>'
					,'</div>'
					,'<a name="content"></a>'
				,'</div>'
			);
			star.tpl_header.compile();
			
			/* Template used for viewing activities */
			star.tpl_acty = new Ext.XTemplate(
				'<div class="relative">'
					// task msg
					,'<tpl for="task_msg">'
						//,'<div class="header task {b_userownstask:this.taskClass}">'
						,'<div class="header task {[values.b_userownstask ? "task_info" : "task_alert"]}">'
							,'<div class="l">'
								,'<div class="r">'
									,'<div class="m">'
										,'<p>'
											,'{s_task}'
										,'</p>'
									,'</div>'
								,'</div>'
							,'</div>'
						,'</div>'
					,'</tpl>'
					
					,'<div class="dlg_frm dlg_frm_padded">'
					
						// activity details
						,'<h1>'
							,'<tpl for="acty_details_header">'
								,'{s_details_chg_icon}{s_type_name} Details'
							,'</tpl>'
						,'</h1>'
						,'<div class="fset">'
							,'<tpl for="acty_details">'
								,'<div{s_chg}>'
									,'<div class="padded">'
										,'<dt{cls}>{s_type_name} Name</dt><dd{cls}>{acty_nm}</dd>'
										,'<div class="brclear"></div>'
										,'<dt{cls}>Entered</dt><dd{cls}>{d_crtd} by {s_crtd_by}</dd>'
										,'<div class="brclear"></div>'
										,'<dt{cls}>Last Updated</dt><dd{cls}>{d_updt} by {s_updt_by}</dd>'
										,'<div class="brclear"></div>'
										,'{acty_fields}'
									,'</div>'
								,'</div>'
							,'</tpl>'
						,'</div>'
					
					
						// questions and responses
						,'<tpl for="question">'
							,'<h1>'
								// change icon
								,'{s_change}'
								,'{s_question}'
							,'</h1>'
							,'<div class="fset">'
								,'{s_rspns_changed}'
								,'{s_rspns}'
							,'</div>'
						,'</tpl>'
					,'</div>'
				,'</div>'
			); //end activity show template
			star.tpl_acty.compile();
			
			star.tpl_acty_form = new Ext.XTemplate(
				//'<form id="{frm_name}" name="{frm_name}" class="dlg_frm nooverflow" method="post">'
				'<div id="{frm_name}" class="dlg_frm">'
					,'<input type="hidden" name="acty_type_id" id="acty_type_id" value="{acty_type_id}" />'
					,'<input type="hidden" name="acty_type_nm" id="acty_type_nm" value="{acty_type_nm}" />'
					,'<input type="hidden" name="acty_id" id="acty_id" value="{acty_id}" />'
					,'<input type="hidden" name="s_taskID" id="s_taskID" value="{s_taskID}" />'
					//details
					,'<h1 class="relative"><span class="req">{s_type} Details</span></h1>'
					,'<div class="fset">'
						//name
						,'<div class="colfull">'
							,'<div class="x-form-item">'
								,'<label class="top" for="acty_nm"><em class="req">{s_type} Name</em></label>'
								,'<div class="x-form-element nopadding">'
									,'<input name="{acty_nm_field}" id="{acty_nm_field}" type="text" value="{acty_nm}" '
										+ 'maxlength="80" title="Please enter an {s_type} name" required="true" />'
								,'</div>'
							,'</div>'
						,'</div>'
						
						//more details
						,'<tpl for="details">'
							,'<div class="col">'
								,'<div class="x-form-item">'
									,'<label class="top" for="acty_start_dt"><em class="req">Start Date</em></label>'
									,'<div class="x-form-element nopadding">'
										,'<input name="acty_start_dt" id="acty_start_dt" type="text" value="{acty_start_dt}"'
											+ 'title="Please enter a Start Date" required="true" />'
									,'</div>'
								,'</div>'
							,'</div>'
							,'<div class="col">'
								,'<div class="x-form-item">'
									,'<label class="top" for="acty_end_dt"><em>End Date</em></label>'
									,'<div class="x-form-element nopadding">'
										,'<input name="acty_end_dt" id="acty_end_dt" type="text" value="{acty_end_dt}" '
											+ 'title="Please enter an End Date" required="true" />'
									,'</div>'
								,'</div>'
							,'</div>'
							,'<div class="brclear"></div>'
						,'</tpl>'
						
						,'<tpl for="highlight">'
							,'<div class="colfull" style="margin-top:12px">'
								,'<div class="fleft" style="padding-left:10px">'
									,'<input type="checkbox" name="acty_hlght_ind" id="acty_hlght_ind"{acty_hghlt} value="Y" />'
								,'</div>'
								,'<span class="fleft" style="margin-left:10px">Include in Highlight Report?</span><br/>'
								,'If selected, and picture(s) are available, please select below one picture for highlight'
								,'<div class="brclear"></div>'
							,'</div>'
						,'</tpl>'
						
						
					,'</div>'//end </div class="fset"> for details
					
					//questions and fields
					,'<tpl for="question">'
						,'<h1>{s_question}</h1>'
						,'<div class="fset">'
							,'{o_label:this.labelType}'
							,'<div class="brclear"></div>'
						,'</div>'
					,'</tpl>'
					
					,'<div class="brclear"></div>'
				,'</div>'
				//,'</form>'
				// functions
				,{
					labelType: function(value) {
						if(value.b_fullLabel) {
							value = '<div><span class="bold padded relative">' + value.s_instr + '</span><br/>&nbsp;</div>'
									+'<div class="col">' + value.s_label + '</div>'
									+'<div class="col">' + value.s_input + '</div>';
						}
						else {
							value.s_instr = value.s_instr.replace(new RegExp('"', "g"),'&quot;');
							value = '<div class="col"><label for="' + value.s_name + '" title="' 
									+ value.s_instr + '">' + value.s_instr + '</label></div>'
									+'<div class="col"><div class="x-form-item"><div class="x-form-element nopadding">' + value.s_input + '</div></div></div>';
						}
						return value;
					}
				}
			); //end activity form template
			star.tpl_acty_form.compile();
			
		}
		
		,slider: function(id, config, group) {
			
			Ext.apply( this, config );
			
			this.create(id, config, group);
			
			
			// Init slider thumb
			this.thumb = new star.Utils.sliderthumb( this );
			//this.thumb.maintainOffset = true;
			// Set start position of slider
			this.setValue( this.start );
			
		}//end star.Utils.slider
		
		//private function depending on star.Utils.slider
		,sliderthumb: function(slider) {
			// Store reference to slider
			this.slider = slider;
			
			//create thumb element
			this.el = $dh.append( this.slider.el_bg, { tag: 'div', cls: 'x-slider-thumb' }, true );
			
			//create input element
			this.slider.el_input = $dh.insertAfter( this.slider.el_bg, 
				{ tag: 'input', id:this.slider.id, name:this.slider.id, type: 'text', size: 2, value:'', cls: 'x-slider-input' }, true );
			this.slider.el_input_ext = new Ext.form.NumberField({
				width:30,
				maxLength:3,
				maxValue:100,
				validationEvent:false,
				applyTo:this.slider.el_input
			});
						
			//when input is changed, change the thumb and set the value of the slider
			this.slider.el_input.on("keyup", function() {
				//if(this.el_input.dom.value == "")
					//this.el_input.dom.value = 0;
				this.setValue(this.el_input.dom.value);
				this.checkTotal();
			}, this.slider);
			
			this.slider.el_input.on("blur", function() {
				if(this.dom.value == "")
					this.dom.value = 0;
			});
			
			if(this.slider.qtip) {
				Ext.QuickTips.register({
					target:  this.el,
					hideOnClick: true,
					text: this.slider.qtip
				});
			}
			
			// Call superclass constructor
			star.Utils.sliderthumb.superclass.constructor.call( this, this.el, slider.el_bg.id, { maintainOffset: true } );
			
			// Change thumb style on mouse hover & click
			this.el.addClassOnOver( 'x-slider-thumb-over' );
			this.el.addClassOnClick( 'x-slider-thumb-click' );
			
			// Calculate & cache the value <-> position conversion factor
			var valRange = this.slider.max - this.slider.min;
			var posRange = slider.el_bg.getWidth() - this.el.getWidth();
			this.factor = valRange / posRange;
			
			//console.log("posrange" + posRange + " factor" + this.factor);
			
			// Set contraints
			this.setXConstraint( 0, posRange );
			this.setYConstraint( 0, 0 );	
			this.cachePosition();
		}
		
		// add/override Ext functions
		,updateExt: function() {
			Ext.form.Field.prototype.msgTarget = 'side';
			// add date patterns
			Date.patterns = {
				ISO8601Long:"Y-m-d H:i:s.0"
				,short: 'M d, Y'
				,full: 'M d, Y g:i A'
			};
			// overide the spacer image to use our own
			Ext.BLANK_IMAGE_URL = 'images/spacer.gif';
			
			Ext.Ajax.timeout = Ext.Updater.defaults.timeout = star.i_XHRTimeout; // update the default timeout of the updateManager
			
			Ext.MessageBox.minWidth = 300; // set minimum width of message boxes
			
			this.updateExtConnections(); // add functions that will throw errors as a result of data calls
			
			this.updateExtDateField(); // fixes ext2.1 datefield bugs, should be removed with next version of extjs
			
			this.updateExtGrid(); // add 508 compliancy to grid
			
			this.updateExtMenu(); // add a load method to ext menu
			
			this.updateExtPagedRowNumberer(); //allow numberer to increment on all pages
			
			this.updateExtSlider(); //add a slider component
		}
		
		// adds functions that will throw visible errors as a result of data calls
		,updateExtConnections: function() {
			
			// when errors occur open a dialog
			Ext.data.Connection.prototype.handleFailure =
			Ext.data.Connection.prototype.handleFailure.createInterceptor(function(response) {
				
				var err_dialog = new star.Window({
					title: 'Error',
			        width:750,
			        height:450,
			        minWidth:300,
			        minHeight:300,
					closeAction:'close',
					items:{
						layout:'fit'
						,cls:'box'
						,autoScroll:true
						,html:response.responseText
					}
				});
				err_dialog.build({});
				err_dialog.show();
				// debug what in heaven's holy name is going on with this blank error. Idealy we want to catch it and then
				// refire the request
				console.log('error');
				console.log(response);
				console.log(this);
				if(response.statusText == "transaction aborted" && !this.b_resend){
					console.log('attempting to resend request');
					this.b_resend = true;
					this.request(response.argument.options);
					return false;
				}
			});
			
			// when no session exists show user a message, also keep track of the session timeout
			Ext.data.Connection.prototype.handleResponse =
			Ext.data.Connection.prototype.handleResponse.createInterceptor(function(response) {
				var s_no = '{"s_status":"noSession"';
				var rt = response.responseText;
				if(rt == 'noSession' || (rt.length>s_no.length && rt.substr(0,s_no.length)==s_no)){
					setTimeout(
						function(){
							Ext.MessageBox.alert('Session Timed Out'
								, 'There has not been any activity in over <strong>'+star.s_sessionTimeout+'</strong>'
								+ ' and so your session has timed out. Please sign in again'
								,star.Utils.goHome
							);
						},400
					);
					return false;
				} else {
					star.Session.resetTimer();
				}
			});
		}
		
		// fixes ext2.1 datefield bugs, should be removed with next version of extjs
		,updateExtDateField: function() {
			// 2.1 Date bug patch
			Ext.apply(Date.parseCodes, {
			    j: {
			        g:1,
			        c:"d = parseInt(results[{0}], 10);\n",
			        s:"(\\d{1,2})" // day of month without leading zeroes (1 - 31)
			    },
			    M: function() {
			        for (var a = [], i = 0; i < 12; a.push(Date.getShortMonthName(i)), ++i); // get localised short month names
			        return Ext.applyIf({
			            s:"(" + a.join("|") + ")"
			        }, Date.formatCodeToRegex("F"));
			    },
			    n: {
			        g:1,
			        c:"m = parseInt(results[{0}], 10) - 1;\n",
			        s:"(\\d{1,2})" // month number without leading zeros (1 - 12)
			    },
			    o: function() {
			        return Date.formatCodeToRegex("Y");
			    },
			    g: function() {
			        return Date.formatCodeToRegex("G");
			    },
			    h: function() {
			        return Date.formatCodeToRegex("H");
			    },
			    P: function() {
			      return Ext.applyIf({
			        s: "([+\-]\\d{2}:\\d{2})" // GMT offset in hrs and mins (with colon separator)
			      }, Date.formatCodeToRegex("O"));
			    }
			});

			// 2.1 Date bug patch
			Date.formatCodeToRegex = function(character, currentGroup) {
			    // Note: currentGroup - position in regex result array (see notes for Date.parseCodes above)
			    var p = Date.parseCodes[character];

			    if (p) {
			      p = Ext.type(p) == 'function'? p() : p;
			      Date.parseCodes[character] = p; // reassign function result to prevent repeated execution      
			    }

			    return p? Ext.applyIf({
			      c: p.c? String.format(p.c, currentGroup || "{0}") : p.c
			    }, p) : {
			        g:0,
			        c:null,
			        s:Ext.escapeRe(character) // treat unrecognised characters as literals
			    }
			};
		}
		
		//add 508 compliancy to grid component
		,updateExtGrid: function() {
			//override initTemplate function to allow 508 compliancy
			Ext.override(Ext.grid.GridView, {
				initTemplates : function(){
					var ts = this.templates || {};
					if(!ts.master){
						ts.master = new Ext.Template(
								'<div class="x-grid3" hidefocus="true">',
									'<div class="x-grid3-viewport">',
										'<div class="x-grid3-header"><div class="x-grid3-header-inner"><div class="x-grid3-header-offset">{header}</div></div><div class="x-clear"></div></div>',
										'<div class="x-grid3-scroller"><div class="x-grid3-body">{body}</div><a href="#" class="x-grid3-focus" tabIndex="-1"></a></div>',
									"</div>",
									'<div class="x-grid3-resize-marker">&#160;</div>',
									'<div class="x-grid3-resize-proxy">&#160;</div>',
								"</div>"
								);
					}
			
					if(!ts.header){
						ts.header = new Ext.Template(
								'<table border="0" cellspacing="0" cellpadding="0" style="{tstyle}">',
								'<thead><tr class="x-grid3-hd-row">{cells}</tr></thead>',
								"</table>"
								);
					}
			
					if(!ts.hcell){
						ts.hcell = new Ext.Template(
								'<td scope="col" class="x-grid3-hd x-grid3-cell x-grid3-td-{id}" style="{style}"><div {tooltip} {attr} class="x-grid3-hd-inner x-grid3-hd-{id}" unselectable="on" style="{istyle}">', this.grid.enableHdMenu ? '<a class="x-grid3-hd-btn" href="#"></a>' : '',
								'{value}<img class="x-grid3-sort-icon" src="', Ext.BLANK_IMAGE_URL, '" />',
								"</div></td>"
								);
					}
			
					if(!ts.body){
						ts.body = new Ext.Template('{rows}');
					}
			
					if(!ts.row){
						ts.row = new Ext.Template(
								'<div class="x-grid3-row {alt}" style="{tstyle}"><table class="x-grid3-row-table" border="0" cellspacing="0" cellpadding="0" style="{tstyle}">',
								'<tbody><tr>{cells}</tr><tr class="hidden">{rowheader}</tr>',
								(this.enableRowBody ? '<tr class="x-grid3-row-body-tr" style="{bodyStyle}"><td colspan="{cols}" class="x-grid3-body-cell" tabIndex="0" hidefocus="on"><div class="x-grid3-row-body">{body}</div></td></tr>' : ''),
								'</tbody></table></div>'
								);
					}
			
					if(!ts.cell){

						ts.cell = new Ext.Template(
									'<td{scoperow} class="x-grid3-col x-grid3-cell x-grid3-td-{id} {css}" style="{style}" tabIndex="0" {cellAttr}>',
											'<div class="x-grid3-cell-inner x-grid3-col-{id}" unselectable="on" {attr}>{value}</div>',
									'</td>'
								);
					}
			
					for(var k in ts){
						var t = ts[k];
						if(t && typeof t.compile == 'function' && !t.compiled){
							t.disableFormats = true;
							t.compile();
						}
					}
			
					this.templates = ts;
			
					this.tdClass = 'x-grid3-cell';
					this.cellSelector = 'td.x-grid3-cell';
					this.hdCls = 'x-grid3-hd';
					this.rowSelector = 'div.x-grid3-row';
					this.colRe = new RegExp("x-grid3-td-([^\\s]+)", "");
				},
				
				doRender : function(cs, rs, ds, startRow, colCount, stripe){
					var ts = this.templates, ct = ts.cell, rt = ts.row, last = colCount-1;
					var tstyle = 'width:'+this.getTotalWidth()+';';
					//console.info(rs);
					// buffers
					var buf = [], cb, c, rh, p = {}, rp = {tstyle: tstyle}, r, ch = [];
					//alert(rs.length);
					for(var j = 0, len = rs.length; j < len; j++){
						r = rs[j]; cb = []; rh = [];
						var rowIndex = (j+startRow);
						for(var i = 0; i < colCount; i++){
							//alert('here');
							c = cs[i];
							p.id = c.id;
							p.i = i;
							p.css = i == 0 ? 'x-grid3-cell-first ' : (i == last ? 'x-grid3-cell-last ' : '');
							p.scoperow = i == 0 ? ' scope="row"' : '';
							p.attr = p.cellAttr = "";

							if(!ch[i]) {
								p.colheader = this.cm.getColumnHeader(i);
								if((s_img = p.colheader.substr(0,4))=="<img") {
									p.colheader = p.colheader.match(/title="(.*?)"/i)[1];
								}
							}
							else
								p.colheader = ch[i];
								
							p.value = c.renderer(r.data[c.name], p, r, rowIndex, i, ds);
							p.style = c.style;
							if(p.value == undefined || p.value === "") p.value = "&#160;";
							if(r.dirty && typeof r.modified[c.name] !== 'undefined'){
								p.css += ' x-grid3-dirty-cell';
							}
							rh[rh.length] = '<th scope="col">' + p.colheader + '</th>';
							cb[cb.length] = ct.apply(p);
						}
						var alt = [];
						if(stripe && ((rowIndex+1) % 2 == 0)){
							alt[0] = "x-grid3-row-alt";
						}
						if(r.dirty){
							alt[1] = " x-grid3-dirty-row";
						}
						rp.cols = colCount;
						if(this.getRowClass){
							alt[2] = this.getRowClass(r, rowIndex, rp, ds);
						}
						rp.alt = alt.join(" ");
						rp.cells = cb.join("");
						rp.rowheader = rh.join("");
						//alert(rp.cells);
						buf[buf.length] =  rt.apply(rp);
					}
					//alert(buf);
					return buf.join("");
				}
			});
		}
		
		//adds new methods to the menu component
		,updateExtMenu: function() {
			
			//override menu item to allow for styles to be added to the image tag
			Ext.override(Ext.menu.Item, {
				onRender : function(container, position){
			        var el = document.createElement("a");
			        el.hideFocus = true;
			        el.unselectable = "on";
			        el.href = this.href || "#";
			        if(this.hrefTarget){
			            el.target = this.hrefTarget;
			        }
			        el.className = this.itemCls + (this.menu ?  " x-menu-item-arrow" : "") + (this.cls ?  " " + this.cls : "");
			        el.innerHTML = String.format(
			                '<img src="{0}" class="x-menu-item-icon {2}"{3} />{1}',
			                this.icon || Ext.BLANK_IMAGE_URL, this.text, this.iconCls || '', this.style || '');
			        this.el = el;
			        Ext.menu.Item.superclass.onRender.call(this, container, position);
				}
		    });
			
			/* No longer necessary because extjs now has a ctCls property that does the same
			//override addButton function in toolbar to allow for parent td of button to have a classname
			Ext.override(Ext.Toolbar, {
				addButton : function(config){
					if(config instanceof Array){
						var buttons = [];
						for(var i = 0, len = config.length; i < len; i++) {
							buttons.push(this.addButton(config[i]));
						}
						return buttons;
					}
					var b = config;
					if(!(config instanceof Ext.Toolbar.Button)){
						b = config.split ?
							new Ext.Toolbar.SplitButton(config) :
							new Ext.Toolbar.Button(config);
					}
					var td = this.nextBlock();
					//add classname to tb
					if(config.clsParent)
						td.className = config.clsParent;
					b.render(td);
					this.items.add(b);
					return b;
				}
			}); */
			
			Ext.menu.Menu.prototype.load = function(options){
				if(options.subItem.b_loaded)
					return;
				options.subItem.b_loaded = true;
				var loader = {text: 'Loading...', icon: 'images/loading.gif', id:'loader'};
				var conn = new Ext.data.Connection();
				//options.subItem.menu = { items: [{text:'test'}] };
				
				//options.subItem.addItem(loader);
				//this.addItem(loader);
				//options.subItem.menu = loader;
				var loadItem = new Ext.menu.Item(loader);
				options.subItem.menu.addMenuItem(loadItem);
				//var a_xy = options.subItem.menu.el.getXY();
				//console.info(options.subItem);
				//return;
				//alert(this.handler);
				
				conn.on('requestcomplete', 
					function(conn, response){
						//console.info(options.subItem.menu);
						//loader.getEl().remove();
						options.subItem.menu.remove(loadItem);
						response = Ext.decode(response.responseText);
						Ext.each( response.st_data.menu, 
							function(curr_item, curr_index){
								//if handler, add handler to every parent without a child
								if(this.handler) {
									if(curr_item.menu) {
										//this is much faster than adding an onclick to each item, otherwise it would've gone down
										//to the second loop below this one
										Ext.each(curr_item.menu,
											function(curr_item2) {
												curr_item2.handler = this.handler;
											},
											this
										);
										
									}
									else
										curr_item.handler = this.handler;
								}
								//if item has "hideonclick", change to "hideOnClick" <- cAsE
								if(curr_item.hideonclick != undefined)
									curr_item.hideOnClick = curr_item.hideonclick;
								
								if(curr_index == 0)
									curr_item = new Ext.menu.TextItem(curr_item);
								options.subItem.menu.addMenuItem(curr_item);
								//options.subItem.menu = new Ext.menu.Menu({items:[{text: 'Loading...', icon: 'images/loading.gif'}]});
								//var curr_menu = this.addMenuItem(curr_item);	
								/*
								if(curr_item.autoheight) {
									//render each submenu item so sub menu items don't lag when it's being rendered
									Ext.each(curr_menu.menu,
										function(inner_item) {
											//this onclick event is much slower than assigning the handler to the handler property, hence, commented out
											//inner_item.on('click', this.handler);
											inner_item.render();
										},
										this
									);
									
									var el = Ext.get(curr_menu.menu.items.get(0).getEl().findParentNode('div.x-menu'));
									el.setHeight(Ext.lib.Dom.getViewHeight()-25, false);
									el.setStyle('overflow-y', 'scroll');
								}*/
							}, 
							this
						);
						
						//options.subItem.menu = new Ext.menu.Menu({items: response.st_data.menu});
						
						if(options.subItem.autoHeight) {
							//options.subItem.menu.on('cbeforeshow', function() {
								//alert('show');
								var el = options.subItem.menu.getEl();
								//el.setWidth(200, false);
								el.setHeight(Ext.lib.Dom.getViewHeight()-25, false);
								el.setY(25);
								el.setStyle('overflow-y', 'scroll');
								//options.subItem.menu.hide();
								
							//}, options.subItem.menu, {single:true});
						}
						this.el.sync();
						//options.subItem.menu.fireEvent('cbeforeshow');

						//options.subItem.menu.getEl().show();
						//options.subItem.menu.show(options.subItem.menu.getEl());
						//console.info(options.subItem.menu.getEl());
						//options.subItem.menu.showAt([999,114]);
						//options.subItem.menu.render();
						//options.subItem.menu.show();
						/*
						if(options.subItem.autoHeight) {
							var el = options.subItem.menu.el;
							el.setHeight(Ext.lib.Dom.getViewHeight()-25, false);
							el.setStyle('overflow-y', 'scroll');
						}*/
						//console.info(options.subItem);
						
					}
					,this
				);
				
				conn.on('requestexception', 
					function(){
						this.remove(loader);
						this.add({text: 'Failed to load menu items'});
					}
					,this
				);
				
				conn.request(options);
			}
		} // end updateExtMenu
		
		//allow numbering to increase with page increment
		,updateExtPagedRowNumberer: function() {
			Ext.grid.PagedRowNumberer = function(config){ 
				Ext.apply(this, config); 
				if(this.rowspan){ 
					this.renderer = this.renderer.createDelegate(this); 
				} 
			}; 
			
			Ext.grid.PagedRowNumberer.prototype = { 
				header: "", 
				width: 30, 
				sortable: false, 
				fixed:true, 
				hideable: false, 
				dataIndex: '', 
				id: 'numberer', 
				rowspan: undefined, 
				 
				renderer : function(v, p, record, rowIndex, colIndex, store){ 
					if(this.rowspan){ 
						p.cellAttr = 'rowspan="'+this.rowspan+'"'; 
					} 
					var i = store.lastOptions.params.start; 
					if (isNaN(i)) { 
						i = 0; 
					} 
					i = i + rowIndex + 1; 
					i = Number(i);
					return i; 
				} 
			};  
	
		}
		
		,updateExtSlider: function() {
			Ext.extend( star.Utils.slider, Ext.util.Observable, {
				min: 0,
				max: 100,
				start: 0,
				value: 0,
				snap: false,
				qtip: '',
				type: 'percent',
				
				//add a slider to an existing one and 'group' them
				addSlider: function(id, config) {
					if(this.total)
						config.total = this.total;
					var slidernew = new star.Utils.slider(id, config, this.el_group);
				},
				
				checkTotal: function() {
					//determine if slider value sum is greater than its total
					if(this.total) {
						if(!this.a_input)
							this.a_input = $q('.'+this.el_group + ' input');
						if(this.a_input.length > 1) {
							var i_total = 0;
							var i_total_before = 0;
							Ext.each(this.a_input, 
								function(item) {
									if(item == this.el_input.dom)
										i_total_before += parseInt(this.i_beforedrag);
									else
										i_total_before += parseInt(item.value);
									i_total += parseInt(item.value);
								}, this
							);
							if(i_total > this.total) {
								//console.log("beforedrag: " + this.i_beforedrag + ",total:" + this.total + ",i_totalbefore:" + i_total_before);
								var total = parseInt(this.i_beforedrag) + parseInt(this.total-i_total_before);
								//console.log(total);
								//move it to the max
								this.setValue(total);
							}
						}
					}
				},
				
				create: function(id, config, group) {
					// Init events
					this.addEvents( {
						slideStart: true,	// Fired when slider move starts
						change: true,		// Fired when slider value is changed
						slideEnd: true		// Fired when slider move ends
					} );
					
					// Init slider (background) element
					this.el = Ext.get( id );
					this.el.addClass( 'x-slider' );
					this.i_beforedrag = this.start;
					
					this.el_bg = $dh.append( this.el, { tag: 'div', cls: 'x-slider-bg' }, true );
					
					this.el_group = (!group) ? Ext.id() : group;
					this.el.addClass (this.el_group);
					if(this.type) {
						if(this.type == "percent")
							this.el.addClass('x-slider-bg-100');
						if(this.type == "num") {
							this.min = 0;
							this.max = 5;
							this.start = 0;
							this.snap = true;
							this.el.addClass('x-slider-bg-5');
						}
					}
					
					/*
					//if(!this.snap) {
						this.el_bg.on("click", function(e) {
							//alert();
							console.log("click");
							var pos = Ext.lib.Event.getXY(e)[0];
							var value = this.min + Math.round( this.thumb.factor * pos );
							this.setValue( value );
							this.i_beforedrag = this.getValue();
							this.checkTotal();
							//this.(Ext.lib.Event.getXY(e)[0]);
						}, this);
					//}
					*/
				},
				
				//gets the value of the slider
				getValue: function() {
					return this.value;
				},
				
				//sets the position of the thumb
				setValue: function( value ) {
					//console.log('begin set value: '+value);
					// Set value
					if( this._setValue( value ) ) {
						//console.log('thumb value: '+value);
						// Update thumb position
						this.thumb.setPos( this.value );
						//console.log(this.value);
					}
				},
				
				// private function that sets the value of the slider
				_setValue: function( value ) {
					// Fix out of bound values
					if( value < this.min ) value = this.min;
					if( value > this.max ) value = this.max;
					
					// Ignore if value is the same
					//if( value === this.value ) return false;
					
					//console.log('_set value: '+value);
					
					// Update value & fire changed event
					this.value = value;
					this.el_input.dom.value = value;
					//this.fireEvent( 'change', this.value );
					return true;
				}
			});
			
			Ext.extend( star.Utils.sliderthumb, Ext.dd.DD, {
				startDrag: function() {
					//this.cachePosition();
					//alert('here');
					this.resetConstraints();
					//this.yoffset = this.el.getStyle('top');
					//console.info();
					/*
					//this.clearConstraints();
					var x = this.el.dom.offsetLeft;
					var y = 189 - this.el.dom.offsetLeft;
					
					this.setXConstraint(0, 189);
					this.setYConstraint(0,0);
					
					console.info(x + ', ' + y);*/
					//console.info("start");
					this.slider.i_beforedrag = this.slider.getValue();
					//this.slider.fireEvent( 'slideStart', this.slider.getValue() );
				},
				
				onDrag: function() {
					var pos = this.el.getX() - this.slider.el_bg.getX();
					//this.el.setStyle('top', this.yoffset);
					var value = this.slider.min + Math.round( this.factor * pos );
					//console.log('ondrag value: ' + value);
					this.slider._setValue( value );
				},
				
				endDrag: function() {
					this.setDelta( 0, 0 );
					this.resetConstraints();
					//console.log('end');
					this.slider.checkTotal();
					if(this.slider.snap) {
						//console.log('snap: '+this.slider.value);
						this.setPos(this.slider.value);
					}
					//this.slider.fireEvent( 'slideEnd', this.slider.getValue() );
				},
				
				setPos: function( value, b_nodrag ) {
					
					//console.log("setpos:" + value);
					//console.log('set pos');
					
					//this.setXConstraint(this.el.dom.offsetLeft, (189 - this.el.dom.offsetLeft));
					var pos = Math.round( (value - this.slider.min) / this.factor );

					var i_bgx = this.slider.el_bg.getX();
					if(!this.b_started) {
						//alert('here');
						this.slider.i_beforedrag = this.slider.getValue();
						this.b_started = true;
						//move slider to its position
						Ext.get(this.slider.thumb.getEl()).shift({x:parseInt(pos + i_bgx)});
						var minPos = i_bgx;
						var maxPos = Math.round((this.slider.max - this.slider.min) / this.factor) + i_bgx;
						this.setXConstraint(pos, (maxPos - (minPos + pos)));
					}
					else {
						this.setDelta( 0, 0 );
						this.resetConstraints();
						this.setDragElPos( pos + i_bgx, this.initPageY );
					}
						
						//Ext.get(this.slider.thumb.getEl()).shift({x:parseInt(pos + this.slider.el_bg.getX())});
					//console.info(this);
				}
			});
			
		}//end updateExtSlider
		
	}; // end return for star.Utils
}(); // end star.Utils

star.Window = function(config) {

	// set the defaults for the window
	Ext.applyIf(config,{
		layout:'fit'
		,modal:true
		,cls:'t-brown'
		,hideBorders:true
		,collapsible: false
		,constrainHeader:true
		,closeAction:'hide'
	});
	// keep track of the class assigned to this window
	this.className = config.cls;
	
	// call the superclass
	star.Window.superclass.constructor.call(this,config);
	//console.log(this);
	
	//this.o_tabs = {}; // object that keeps track of all the tabs we add
	this.o_buttons = {};
	
};
Ext.extend(star.Window, Ext.Window, {

	addTab: function(item, tabs) {
		//var othis = (Ext.type(tabs)=="object") ? tabs : this;
		var tab = {
			title:item.s_title
			,id:item.s_name
			,layout:'fit'
		};
		// add any extra params passed in that are not our specific arguments. We
		// know our arguments because they begin with something like o_ or b_ , etc.
		for (var k in item)
			if(k.length > 2 && k.substr(1,1)!='_'){
				//console.log("adding param:"+k);
				tab[k] = item[k];
			}
		
		if(!tab.a_buttons)
			tab.a_buttons = [];
		if(!tab.bbar)
			tab.bbar = new Ext.Toolbar();
		//tab.bbar = [];
		if(item.s_body)
			tab.html = item.s_body;
		// add events if necessary
		if(item.o_url)
			tab.autoLoad = {
				url:item.o_url.s_url
				,params:item.o_url.config
			};
		if(!tab.listeners)
			tab.listeners = {};
		if(item.fn_init)
			tab.listeners.activate = {fn:item.fn_init, single:true};
		if(item.fn_show)
			tab.listeners.show = {fn:item.fn_show};
		
		// if tabs was passed in then that means we aren't building but that the tabs already exist.
		// So let's just add the tab immediately
		if(tabs)
			tab = tabs.add(tab);
		
		return tab;
	}
	
	,build: function(o){ // builds the dialog tabs, content, buttons, etc.
		//move to front
		/* this.toFront(); */
		
		// set the title if necessary
		if(o.s_title)
			this.setTitle(o.s_title);
		else
			this.setTitle('');
		
		//resize to fit browser
		var i_height = 0;
		if(Ext.lib.Dom.getViewHeight() > 600)
			i_height = 600
		else
			i_height = Ext.lib.Dom.getViewHeight() - 20;
		if(!o.i_width)
			o.i_width = this.width;
		if(!o.i_height)
			o.i_height = i_height;
		
		this.setSize(o.i_width, o.i_height);
		
		if(o.cls)
			this.setClassName(o.cls);
		
		if(o.a_tabs) {
			var activeTab = 0;
			if(o.activeTab)
				activeTab = o.activeTab;
			this.setTabs(o.a_tabs,activeTab);
		}
		// remove the tabs when the dialog is being hidden
		this.on("beforehide", function() {
			//destroy tab panel
			//alert('here');
			//this.getTabs().purgeListeners();
			this.removeContents();
			//remove all listeners for the dialog
			//this.purgeListeners();
		}, this);
		
	}
	
	,getContents: function() {
		if(this.items && this.items.items)
			return this.items.items[0];
		else
			return null;
	}
		
	,getTabs: function() {
		return this.getContents();
	}
	
	/* ,hideAllButtons: function() {
		console.log("hiding all buttons");
		for(var i in this.o_buttons)
			this.o_buttons[i].hide();
	} */
	
	,removeContents: function() {
		if(this.getTabs())
			this.remove(this.getTabs(),true);
		this.o_buttons = {};
		/* if(this.buttons) {
			Ext.each(this.buttons, function(item) {
				item.destroy();
			});
			this.o_buttons = {};
		} */
		/* for(var k in this.o_buttons){
			console.log("removing button");
			console.log(this.o_buttons[k]);
			this.remove(this.o_buttons[k],true);
			this.o_buttons[k].destroy();
		} */
	}
	
	,setButtons: function(s_tab, a_buttons) {
		var tab = this.getTabs().findById(s_tab);
		var bbar = tab.getBottomToolbar();
		if(a_buttons.length){
			//bbar.setVisible(true);
			bbar.addFill();
			
			Ext.each(a_buttons, function(item) {
				//if(Ext.isEmpty(this.o_buttons[item.s_name]))
					this.o_buttons[item.s_name] = bbar.addButton(item);
				
				tab.a_buttons.push(item.s_name);
				//console.log(this.o_buttons[item.s_name]);
			}, this);
			tab.syncSize();
			this.doLayout();
		}
	}
	
	,setClassName: function(cls){ // sets the class of the panel
		if(this.className!=cls){
			this.removeClass(this.className);
			this.addClass(cls);
			this.className = cls;
		}
	}
	
	,setTabs: function(a_tabs,activeTab) {
		//var dlg_tabs = this.getTabs();
		this.removeContents();
		//this.initTabs(); //clear out all old tabs
		var a_items = [];
		Ext.each(a_tabs, function(item){ a_items.push(this.addTab(item)); }, this);
		// add the tab panel
		var tbpanel = this.add({
			xtype:'tabpanel'
			,activeTab:activeTab
			,defaults:{autoScroll:true}
			,items:a_items
		});
	}
	
}); // end extending star.Window

// global functions to work with charts
// TODO: Rewrite xx_move_tag function to use ext event code so we can know exactly where to place the tip
// using things like e.getTarget(). Will have to replace the onMousemove attributes on the charts
function xx_set_visible(id, e, value){
	if (!xx_supported_client()) return ;
	xx_get_by_id(id).style.visibility= value ? "visible" : "hidden";
	// ahewitt - move the popup to the document level so that it moves around accurately
	if(value && !xx_get_by_id(id).b_moved){
		Ext.get(id).appendTo(document.body);
		xx_get_by_id(id).b_moved = true;
	} // end mod by ahewitt
	if(value) xx_move_tag(id,e);
	xx_get_by_id(id).style.display=value ? "" : "none";
}

function xx_move_tag(id,e){
	if (!xx_supported_client()) return ;
	var popup = xx_get_by_id(id);
	if (popup.style.visibility!="visible") return ;

	var ie=document.all;
	var ns6=!(!document.getElementById || ie)   ; /*document.getElementById AND !document.all*/

	var iebody = !(!document.compatMode || document.compatMode=="BackCompat")? document.documentElement : document.body;

	var dx = 10, dy = 10;
	var posX=(ns6)?e.pageX : event.x+iebody.scrollLeft;
	var posY=(ns6)?e.pageY : event.y+iebody.scrollTop;

	if(ie || ns6) {
		var parent = popup.offsetParent ;
		while(parent) {		
			posX -= parent.offsetLeft;
			posY -= parent.offsetTop;
			parent=parent.offsetParent;
		}
	}

	var ieNOTopera = !(!ie || window.opera);	
	var rightedge= ieNOTopera ? iebody.clientWidth-event.clientX: window.innerWidth-e.clientX-20
	var bottomedge=ieNOTopera ? iebody.clientHeight-event.clientY : window.innerHeight-e.clientY-20

	if (xx_less(rightedge-dx,popup.offsetWidth))
		posX=ie? iebody.scrollLeft+event.clientX-popup.offsetWidth : window.pageXOffset+e.clientX-popup.offsetWidth;

	if (xx_less(bottomedge-dy,popup.offsetHeight)) {
		posY=ie? iebody.scrollTop+event.clientY-popup.offsetHeight : window.pageYOffset+e.clientY-popup.offsetHeight;
		dy =-dy;
	}
	
	var posx = 0;
	var posy = 0;
	if (!e) var e = window.event;
	if (e.pageX || e.pageY) 	{
		posx = e.pageX;
		posy = e.pageY;
	}
	else if (e.clientX || e.clientY) 	{
		posx = e.clientX + document.body.scrollLeft
			+ document.documentElement.scrollLeft;
		posy = e.clientY + document.body.scrollTop
			+ document.documentElement.scrollTop;
	}
	popup.style.left=posX+dx+"px";
	popup.style.top=posY+dy+"px" ;
}

function xx_less(l,r) { return Math.max(l-r,0) == 0 ; /* l LE r */}
function xx_and(l, r) { return   !(!l || !r);         /*l AND r */}
function xx_supported_client() { 	return (document.all) || (document.getElementById);}
function xx_get_by_id(id) { return document.all? document.all[id]: document.getElementById? document.getElementById(id) : "" }
// end global chart functions

// spelling functions
function ActivSpellClass() {
	this.init();	
}

ActivSpellClass.prototype = new Object();
ActivSpellClass.prototype.init = function() {
	this.argsIndex = -1;
	this.fieldRefs = new Array();
	this.ignore = new Array();
	this.change = new Array();
	this.changeto = new Array();
	this.replacements = new Array();
}

ActivSpell = new ActivSpellClass();

function nextField() {

}

function spell(scroll_el,a_dom) 
{	
	ActivSpell.init();
	var a_flds = [];
	for (var i=0; i < arguments[1].length; i++) {
		a_flds[i] = "Ext.getDom('"+arguments[1][i]+"').value";
	};
	ActivSpell.fieldRefs = a_flds;
	
	//override nextField since registering onpropertychange fires itself
	nextField = function() {
		ActivSpell.argsIndex++;
		if(ActivSpell.argsIndex < ActivSpell.fieldRefs.length) {
			scroll_el.scrollTo('top',Ext.get(a_dom[ActivSpell.argsIndex]).up('div.fset').dom.offsetTop,true);
			if (eval(ActivSpell.fieldRefs[ActivSpell.argsIndex]).length == 0) {
				nextField();
			} else
				//console.log('you are here');
			ActivSpellWin = window.open("window.cfm?jsvar=" + ActivSpell.fieldRefs[ActivSpell.argsIndex], "ActivSpellWin", "height=230,width=450,status=no,toolbar=no,menubar=no,location=no");
		} else {
			spellCheckComplete();
		}
	}
	
	//index ActivSpell.argsIndex
	ActivSpell.argsIndex++;
	
	//send the first field to spellcheck
	if (eval(ActivSpell.fieldRefs[ActivSpell.argsIndex]).length == 0) {
		nextField();
	} else {
		scroll_el.scrollTo('top',Ext.get(arguments[1][0]).up('div.fset').dom.offsetTop,true);
		ActivSpellWin = window.open("spellchecker/spellchecker/window.cfm?jsvar=" + ActivSpell.fieldRefs[0], "ActivSpellWin", "height=230,width=450,status=no,toolbar=no,menubar=no,location=no");	
	}
}

function spellCheckComplete() {
	//alert("Spell Check Complete!");
	Ext.MessageBox.alert('Spell Check', 'Spell Check Complete!');
	
	ActivSpell.argsIndex = -1;
	nextField = function() {}
	ActivSpellWin.close();
}
// end spelling functions

// Assign global pointers so that we don't have to use the long namespacing
//var $Dom = YAHOO.util.Dom;
//var $Event = YAHOO.util.Event;
//var $Anim = YAHOO.util.Anim;
//var $Panel = YAHOO.widget.Panel;
//var $Conn = YAHOO.util.Connect;
//var $Slider = YAHOO.widget.Slider;

// shortcuts to star stuff
//var $Elem = star.Element;
//var $sect = star.Section;
// set shortcut vars
var $dq = Ext.DomQuery;
var $dh = Ext.DomHelper;
var $q = Ext.DomQuery.select;
var $qn = Ext.DomQuery.selectNode;
var $el = Ext.Element;
//var $ev = YAHOO.util.Event;
var $ev = Ext.lib.Event;
var $conn; // will become a connection object pointing to the server
var $sect = star.Section;

// initialize
Ext.onReady(star.init);