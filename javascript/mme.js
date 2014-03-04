/*****************************************************************
Template: myme.js

Date created: 08/07/2010

Author: Kwaku Otchere ospinto@gmail.com

Type: Javascript

Description: Main js file that contains all the code common to the browser side of the application.

Related files:
	index.html
*****************************************************************/

//namespace
if (typeof mm == "undefined") { mm = {}; }

//globals
var card_layout; //overall card layout for main right section
var a_section = ['#page','#journal','#member'];
var s_section = 'page'; //section
var s_curr_page; //current page
var s_curr_title; //current page title
var s_path_home = 'http://184.91.170.26:8500/myme';
var s_path_request = s_path_home + '/proxy.cfm?';
var s_path_login = s_path_home + '/login.html';
var a_metrics = [];
var o_render = {}; //store b_renders of sections
var i_session_timeout = 1200000; //session timeout in milliseconds
var i_session_warning = 120000; //session warning time in milliseconds
var o_location = ''; //user location

/* Overides console object if it does not exist */
if(typeof console == 'undefined') {
	console = function(){
		return {
			info: function(s_msg) {},
			log: function(s_msg) {},
			warn: function(s_msg) {},
			error: function(s_msg) {}
		};
	}();
}
/*****************************************************************
			=== INIT ===
*****************************************************************/
// initialize function
mm.init = function() {
	//ICONS HOVER
	Ext.getBody().on({
		'mouseover': {
			fn: function(e, o) {
				var el = Ext.get(o);
				if(el.hasClass('ico')) {
					el.addClass('on');
				}
			}
		},
		'mouseout': {
			fn: function(e, o) {
				var el = Ext.get(o);
				if(el.hasClass('ico')) {
					Ext.get(o).removeClass('on');
				}
			}
		}
	}, this, {delegate:'.ico'});
	
	//new viz
	Ext.get('canvas_new').on("click", function(e, o) { 
		mm.viz.o_win_viz.show();
	});
	
	//add statement
	Ext.get('canvas_statement').on("click", function(e, o) { 
		mm.canvas.addStatement();
	});
	
	//logo
	Ext.get('logo').on('click', function(e, o) {
		document.location.href = s_path_home;
	});
	
	//close incentivisor
	Ext.get('incentivisor_close').on('click', 
		function(e, o) { 
			mm.incentivisor.close();
		}
	);
	
	//logout
	Ext.get('hd_logout').on('click', 
		function(e, o) { 
			mm.data.request({
				params: {event: 'auth.logout'},
				fn_success: function(o) {
					document.location.href = s_path_login;
				}
			});
		}
	);
	
	//when username is clicked, access user profile
	Ext.get('hd_usr').on("click", 
		function() { 
			mm.hash.rite('member');
			card_layout.layout.setActiveItem('card_member');
		}
	);
	
	mm.canvas.o_tpl.compile();
	mm.mask.show('all', Ext.getBody(), 'loading MyMe application. Please wait...');
	mm.entry.init();
	mm.pages.init();
	mm.blog.init();
	mm.mood.init();
	mm.viz.init();
	//mm.user.init();
	mm.journal.init();
	//initialize history states
	Ext.History.init();
	//on change, goto different sections
    Ext.History.on('change', function(s_token){
		mm.hash.goto();
    });
	mm.session.init();
	//mm.contentLayout.init();
	//mm.hash.find();
	
};//end init

/*****************************************************************
			=== BLOG ===
*****************************************************************/
mm.blog = function() {
	return {
		a_blogs: [],
		i_curr:0,
		i_timeout:0,
		fn_loop: {},
		i_tab_x: undefined,
		//initialize blog side bar
		init: function(){
			//mm.mask.show('side_blog', 'blog_mid');
			mm.blog.list();
		},//end init
		
		//list side blogs
		list: function(){
			var tpl = new Ext.DomHelper.createTemplate('<td><h2>{s_title}</h2><p>{s_body}<br><a href="{s_link}" class="link" target="blog">read more</a></p></td>');
			var tab = Ext.get('table_blogger');
			
			//create call				
			mm.data.request({
				params: {event:'extra.blog'},
				fn_success: function(a_blogs) {
					tab.setWidth(167 * a_blogs.length);
					mm.blog.a_blogs = a_blogs;
					Ext.each(mm.blog.a_blogs,function(o,i){
						var el = tpl.append('table_blogger_row', {
							s_title:o.title,
							s_body: o.body,
							s_link: o.link
						});

						var extra_cls = (i===0) ? ' active' : '';
						var el_li = Ext.DomHelper.append('blog_links', {tag:'li', cls:'link'+extra_cls, bindex:i, id:'blg_'+i});
						
						//when clicked, cleartimeout and switch link	
						Ext.get(el_li).on('click', 
							function() {
								clearInterval(mm.blog.i_timeout);
								mm.blog.switchout(el_li, el_li.getAttribute('bindex'));
							}
						);
						
						//add .on class on mouseover
						Ext.get(el_li).addClassOnOver('on');
						
					}, this);
				}
			});
			
			//start auto loop
			mm.blog.i_timeout = setInterval(mm.blog.loop,4000);
			
			//when mouse over, stop auto loop
			Ext.get('blog_mid').on('mouseover',
				function() {
					clearInterval(mm.blog.i_timeout);
					mm.blog.i_timeout = -1;
				}
			);
			
		},//end list
		
		//loop side blogs
		loop: function()  {
			//console.log(mm.blog.i_timeout);
			//remove mask
			//mm.mask.hide('side_blog');
			//loop
		//	mm.blog.fn_loop = function() {
				var next_curr = (mm.blog.i_curr+1 >= mm.blog.a_blogs.length) ? 0 : mm.blog.i_curr + 1;
				mm.blog.switchout(Ext.getDom('blg_'+next_curr), next_curr);
			//	mm.blog.i_timeout = setTimeout('mm.blog.fn_loop()',4000);
		//	}
			//if(mm.blog.i_timeout!=-1)
		//		setTimeout('mm.blog.fn_loop()',4000);
		},//end loop
		
		//switch side blog
		switchout: function(el_li, index) {
			var tab = Ext.get('table_blogger');
			if(mm.blog.tab_x == undefined) {
				mm.blog.tab_x = tab.getX();
			}
			//slide table
			tab.shift({x:mm.blog.tab_x-(167*el_li.getAttribute('bindex'))});
			//delete previous link
			Ext.get('blg_'+mm.blog.i_curr).removeClass('active');
			//set active link
			mm.blog.i_curr = index;
			Ext.get(el_li).addClass('active');
		}
	};//end return
}();//end blog


/*****************************************************************
			=== CANVAS FUNCTIONS ===
*****************************************************************/
mm.canvas = function() {
	return {
		i_col1_height:0,
		i_col2_height:0,
		o_tpl: new Ext.XTemplate('<div class="c_box c_box_{type}" groupingid="{grouping_id}" pageid="{page_id}">',
				'<tpl if="type == &quot;viz&quot;">',
					'<em class="c_ico c_ico_{icon}"></em>',
					'<em class="c_type">{type_name}</em>',
					'<br class="brclear"/>',
					'<div class="c_data"><img src="{content}"></div>',
					'<div class="c_footer">{extra}</div>',
					'<i class="c_edit" cid="{id}" metricid="{metric_id}" presetid="{preset_id}"></i>',
					'<i class="c_delete" cid="{id}"></i>',
				'</tpl>',
				'<tpl if="type == &quot;statement&quot;">',
					'<textarea id="txt_{id}" class="c_data c_data_{type}">{content}</textarea>',
				'</tpl>',
				'<tpl if="type != &quot;viz&quot; &amp; type != &quot;statement&quot;">',
					'<em class="c_ico c_ico_{icon}"></em>',
					'<em class="c_type">{type_name}</em>',
					'<br class="brclear"/>',
					'<div class="c_data c_data_{type}">{content}</div>',
					'<div class="c_footer">{extra}</div>',
					'<i class="c_edit" cid="{id}" metricid="{metric_id}" presetid="{preset_id}"></i>',
					'<i class="c_delete" cid="{id}"></i>',
				'</tpl>',
				
			'</div>'),
		
		//addGrouping
		addGrouping: function(o_params) {
			//add call		
			mm.data.request({
				params: o_params,
				fn_success: function(o) {
					//load groupings
					mm.canvas.loadGrouping(o);
				}
			});
		},//end addgrouping
		
		//addStatement
		addStatement: function() {
			//load groupings
			mm.data.request({
				params: {event:'canvas.addStatement', pageid:s_curr_page},
				fn_success: function(o) {
					mm.canvas.loadGrouping(o);
				}
			});
		},//end add statement
		
		//create text editor
		createEditor: function() {
			
		},//end createditor
		
		//create grouping box
		createBox: function() {
			
		},//end createBox
		
		//edit grouping
		editGrouping: function(o) {
			mm.viz.o_win_viz.show(null, mm.viz.populate(o));
		},//end editgrouping
		
		//focusStatement
		focusStatement: function(s_id, b_show) {
			if(b_show) {
				//show save and cancel buttons
				Ext.getCmp('save_'+s_id).show();
				Ext.getCmp('cancel_'+s_id).show();
			}
			else {
				Ext.getCmp('save_'+s_id).hide();
				Ext.getCmp('cancel_'+s_id).hide();
			}
		},//end focusStatement
		
		//get grouping item
		getGrouping: function(s_page_id, o) {
			var o_group = { 
				icon:'weight', content:o.viz.content, type:o.type, grouping_id:o.id, type_name:o.name, 
				id:o.id, extra:o.title, page_id:s_curr_page, metric_id:o.metric_id, preset_id:o.preset_id
			};
			o_group.page_id = s_page_id;
			var s_html = mm.canvas.o_tpl.apply(o_group);
			var o_group_item = {id:'port_'+o.id, html:s_html, listeners:{}};
			//if text type
			if(o.type == 'statement') {
				//add header
				o_group_item.header = true;
				o_group_item.title = o.name;
				o_group_item.footer = true;
				o_group_item.iconCls = 'c_ico_weight';
				//use tools as edit/delete buttons
				o_group_item.tools = [
					//edit button
					{id:'gear', handler:function() {
						mm.canvas.editGrouping({preset_id:o.preset_id, metric_id:o.metric_id});
					}},
					//delete button
					{id:'pin', handler: function() {
						mm.canvas.removeGrouping({ pageid: s_curr_page, groupingid: o.id });
					}}
				]
				
				//add buttons
				o_group_item.buttons = [
					{
						//save
						text:'save',
						id:'save_' + o.id,
						iconCls: 'ico ico_accept',
						hidden:true,
						width:50,
						listeners: {
							click: function() {
								mm.mask.show('grouping_' + o.id, 'port_' + o.id, "Saving grouping...");
								var s_id = o.id;
								mm.data.request({
									params: {event: 'canvas.saveStatement', groupingid:o.id, content:Ext.getDom('txt_' + o.id).value},
									fn_success: function(o) {
										mm.mask.hide('grouping_'+s_id);
									}
								});
							},
							//before hide check here to make sure click is fired before hiding due to blur
							beforehide: function(btn) {
								if(btn.el.hasClass('x-btn-over')) {
									btn.fireEvent('click');
								}
							}
						}
					},
					{
						//cancel
						text:'cancel',
						id:'cancel_' + o.id,
						iconCls:'ico ico_cancel iconcel',
						hidden:true,
						listeners: {
							click: function() {
								Ext.getDom('txt_' + o.id).value = o_group.content;
								Ext.getCmp('ctxt_'+o.id).autoSize();
							},
							beforehide: function(btn) {
								if(btn.el.hasClass('x-btn-over')) {
									btn.fireEvent('click');
								}
							}
						}
					}
				];
				
				//grouping listeners
				o_group_item.listeners = {
					afterrender: function() {
						var t = new Ext.form.TextArea({
							applyTo:'txt_' + o.id,
							name:'etxt_' + o.id,
							id:'ctxt_' + o.id,
							grow:true,
							growMin:1,
							preventScrollbars: true,
							cls:'c_data c_data_text',
							listeners: {
								focus: function() {
									mm.canvas.focusStatement(o.id, true);
								},
								blur: function() {
									mm.canvas.focusStatement(o.id, false)
								}
							}
						});
					}
				};
			}
			
			//edit/delete on/off
			o_group_item.listeners.render = function() {
				this.getEl().addClassOnOver('on');
			}
			
			return o_group_item;
		},//end get grouping
		
		//list groupings
		listGroupings: function(a_o_grouping) {
			var a_items_col1 = [];
			var a_items_col2 = [];
			
			Ext.each(a_o_grouping.groupings,function(o,i){
				//build with template
				var o_add = mm.canvas.getGrouping(a_o_grouping.page.id, o);
				if(o.hplacement == 1) {
					a_items_col1.push(o_add);
				}
				else {
					a_items_col2.push(o_add);
				}
			}, this);
			
			//add to columns and refresh layouts
			mm.canvas.o_can1.add(a_items_col1);
			mm.canvas.o_can1.doLayout();
			mm.canvas.o_can2.add(a_items_col2);
			mm.canvas.o_can2.doLayout();
			
			mm.mask.hide('all');
			
			if(!o_render.b_canvas_edit) {
				o_render.b_canvas_edit = true;
				//when the edit link is clicked...
				Ext.get('c_p').on("click", 
					function(e, o) {
						mm.canvas.editGrouping({preset_id:o.getAttribute('presetid'), metric_id:o.getAttribute('metricid')});
					}, this, {delegate: ".c_edit"}
				);
				
				//when the delete link is clicked...
				Ext.get('c_p').on("click", 
					function(e, o) {
						var el = Ext.get(o).parent().dom;
						mm.canvas.removeGrouping({ pageid: el.getAttribute('pageid'), groupingid: el.getAttribute('groupingid') });
					}, this, {delegate: ".c_delete"}
				);
			}
			
		},//end canvas.list
		
		//load canvas
		load: function(s_id) {
			if(!mm.canvas.o_can1) { mm.canvas.o_can1 = Ext.getCmp('can_1'); }
			if(!mm.canvas.o_can2) { mm.canvas.o_can2 = Ext.getCmp('can_2'); }
			
			mm.canvas.o_can1.removeAll(true);
			mm.canvas.o_can2.removeAll(true);
			
			//mm.mask.show('canvas', 'card_page', 'Loading content, please wait...');
			mm.mask.show('all', Ext.getBody(), 'loading content. Please wait...');
			
			//load call		
			mm.data.request({
				params: {event:'canvas.load', pageid: s_id},
				fn_success: function(o) {
					console.log(o);
					mm.canvas.listGroupings(o);
				}
			});
		},//end canvas.load
		
		//load grouping
		loadGrouping: function(s_grouping_id) {
			//send load call
			mm.data.request({
				params: {event:'canvas.loadGrouping', groupingid: s_grouping_id},
				fn_success: function(o) {
					//build with template
					var o_add = mm.canvas.getGrouping(s_curr_page, o);
					//add to canvas
					mm.canvas.o_can1.add(o_add);
					mm.canvas.o_can1.doLayout();
					mm.mask.hide('all');
					//alert
					Ext.Msg.alert("Note", "Grouping was successfully added");
				}
			});
		},//end loadGrouping
		
		//move grouping
		moveGrouping: function(o_params) {
			Ext.applyIf(o_params, {event:'canvas.move'});
			//send move call		
			mm.data.request({
				params: o_params,
				fn_success: function(o) {
					//console.log(o);
				}
			});
		},//end move grouping
		
		//remove grouping
		removeGrouping: function(o_params) {
			Ext.Msg.confirm('Confirm', 'Are you sure you want to do delete this grouping?', 
				function(btn) {
					if(btn == 'yes') {
						Ext.applyIf(o_params, {event:'canvas.removegrouping'});
						Ext.getCmp('can_1').remove('port_' + o_params.groupingid);
						Ext.getCmp('can_2').remove('port_' + o_params.groupingid);
						//send remove call
						mm.data.request({
							params: o_params,
							fn_success: function(o) {
								//Ext.Msg.alert("Note", "Grouping was successfully deleted");
							}
						});
					}
				}
			);
		}//end remove grouping
	};//end return
}();//end canvas


/*****************************************************************
			=== CONTENT LAYOUT ===
*****************************************************************/
mm.contentLayout = function() {
	return	{
		o_input_page_title: {},
		init: function(o_tree) {		
			//build main panel
			card_layout = new Ext.Panel({
				id:'card_all',
			    layout:'card',
			autoHeight:true,
				layoutOnCardChange: true,
				renderTo:'panel_main',
			    activeItem: 'card_zero', //init 
			    //bodyStyle: 'padding:15px',
				style:'margin-bottom:10px',
				border:false,
			    defaults: {
			        border:false
			    },
				listeners: {
					afterrender: function() {
						mm.mask.hide('all');
						mm.hash.goto(this, o_tree);
					}
					,afterlayout: function(o) {
						if(o.layout.activeItem.id == 'card_member' && !o_render['member.profile']) {
							//set member.profile to true
							o_render['member.profile'] = true;
							//init user section
							mm.user.init();
							//add tabs
							Ext.getCmp('card_member_tabs').add(mm.user.o_tabs_user);
							Ext.getCmp('card_member_tabs').doLayout();
							
						}
					}
				},
			    
			    items: [
				//CARD ZERO -- DEFAULT PSEUDO CARD
				{
					id: 'card_zero',
					layout:'fit',
					defaults:{border:false},
					html:''
			    },
				//CARD 0 (VISUALIZATION ARRANGEMENT)
				{
			        id: 'card_page',
			        layout:'fit',
					autoHeight:true,
					width:735,
					defaults:{border:false},
					items:{
						layout:'anchor',
						autoHeight:true,
						defaults:{border:false},
						items:[
							{
								//HEADER
								layout:'card',
								id:'card_page_title',
								activeItem:0,
								//height:100,
								//defaults:{border:false},
								cls:'sub_header',
								items: [
									{
										border:false,
										id:'page_display_title',
										html:'<div id="page_title"><em id="page_title_text"></em><a class="underline bold" id="page_title_link">edit</a></div>'
									},
									{
										border:false,
										id:'page_display_title_edit',
										html:'<em id="page_title_input"></em>' +
												'<span id="save_page_title" class="ico ico_accept">save</span>' +
												'<span id="cancel_page_title" class="ico iconcel ico_cancel">cancel</span>' +
												'<br class="brclear">'
									}
								],
								listeners: {
									afterrender: function() {
										//events for page edit link
										Ext.get('page_title_link').on({
											'click': {
												fn: function() {
													mm.contentLayout.o_input_page_title.setValue(Ext.util.Format.htmlDecode(Ext.get("page_title_text").dom.innerHTML));
													Ext.getCmp('card_page_title').layout.setActiveItem('page_display_title_edit');
													mm.contentLayout.o_input_page_title.focus(true);
												}
											}
										});
										
										//create input for edit page
										mm.contentLayout.o_input_page_title = new Ext.form.Field({
											renderTo:'page_title_input',
											name:'page_title_input',
											allowBlank:false,
											width:300,
											height:25,
											selectOnFocus: true,
											listeners: {
												//check for enter key
												specialkey: function(f, e) {
													if(e.getKey()==e.ENTER) {
														mm.pages.editPage(s_curr_page, f.getValue());
													}
													else if(e.getKey()==e.ESC) {
														Ext.getCmp('card_page_title').layout.setActiveItem('page_display_title');
													}
												}
											}
										});
										
										//save page event
										Ext.get("save_page_title").on("click", 
											function() { 
												mm.pages.editPage(s_curr_page, mm.contentLayout.o_input_page_title.getValue());
											}
										);
										
										//add cancel event
										Ext.get('cancel_page_title').on("click", 
											function() { 
												Ext.getCmp('card_page_title').layout.setActiveItem('page_display_title');
											}
										);
											
									}//end afterrender
								}//end listeners
							},//end items card_page_title
							{
								//region:'center',
								layout:'fit',
								autoHeight:true,
								//height:1000,
								id:'canvas_portal',
								items:{
									xtype:'portal',
									id:'c_p',
									//bufferResize:true,
									border:false,
									autoHeight:true,
									listeners: {
										resize: function() {
											//console.log('resize');
										},
										drop: function(o) {
											console.log(o);
											//get proxy height
											var proxy_height = o.source.proxy.getEl().getHeight();
											
											
											//when portal is dropped, request move call
											var el = Ext.DomQuery.selectNode('.c_box', o.data.panel.el.dom);
											mm.canvas.moveGrouping({
												pageid: el.getAttribute('pageid'),
												id: el.getAttribute('groupingid'),
												h: o.columnIndex + 1,
												v: o.position + 1
											});
										},
										afterrender: function(o) {
										}
									},
									//region:'center',
									items:[
										{
											//column 1
											columnWidth:0.5,
											style:'padding:0 0 10px 10px',
											autoHeight:true,
											id:'can_1',
											border:false,
											defaults: { header:false, frame:false, cls:'canvas_box', border:false, style:{marginBottom:'10px'} },
											items:[],
											listeners: {
												afterrender: function(o) {
													
												}
											}
										},
										{
											//column 2
											columnWidth:0.5,
											style:'padding:0 0px 10px 10px',
											autoHeight:true,
											id:'can_2',
											border:false,
											defaults: { header:false, frame:false, cls:'canvas_box', border:false, style:{marginBottom:'10px'} },
											//autoHeight:true,
											items:[]
										}
									]
								}//end items
							}
						]
					},
					listeners: {
						show: function() {
							Ext.get('canvas_new').show();
							Ext.get('canvas_statement').show();
							s_section = 'page';
						}
					}
					
			    },//end of card-0
				
				//CARD 1 (JOURNAL)
				{
			        id: 'card_journal',
					layout:'fit',
					//width:735,
					autoHeight:true,
					defaults:{border:false},
					items:{
						layout:'anchor', defaults:{border:false}, border:false, autoHeight:true,
						items:[
							{html:'My Journal', height:40, cls:'sub_header'},
							{id:'journal_wing_left', width:8},
							{id:'journal_wing_right', width:8},
							//grid
							{layout:'fit',autoHeight:true, items:mm.journal.o_grid_journal, style:{ padding:'0 8px' } }
						]
					},
					listeners: {
						//load when shown
						show: function() {
							s_curr_page = '';
							Ext.get('canvas_new').hide();
							Ext.get('canvas_statement').hide();
							s_section = 'journal';
							mm.incentivisor.get();
							mm.pages.deselectPage();
							mm.journal.o_grid_journal.store.load({params:{perpage:10,start:0}});
							mm.hash.setTitle('Journal');
						}
					}
			    },//end of card-1 (journal)
				
				//CARD 2 (USERS)
				{
					id: 'card_member',
					layout:'fit',
					autoHeight:true,
					width:735,
					defaults:{border:false},
					items:{
						layout:'anchor', defaults:{border:false},
						items:[
							{html:'My Profile Page', height:40, cls:'sub_header'},
							//tabs
							{id:'card_member_tabs', layout:'fit',autoHeight:true, items:[]}//mm.user.o_tabs_user}
						]
					},
					listeners: {
						//deselect page when shown
						show: function() {
							s_curr_page = '';
							Ext.get('canvas_new').hide();
							Ext.get('canvas_statement').hide();
							s_section = 'user';
							mm.incentivisor.get();
							mm.pages.deselectPage();
							mm.hash.setTitle('Member Profile');
						}
					}
			    }]//end of card-2 (users)
			});
		}//end init
	};
}();


/*****************************************************************
			=== HANDLER FOR SERVER SIDE DATA ===
*****************************************************************/
mm.data = function() {
	return {
		//decode data into js object
		decode: function(o) {
			return Ext.decode(o.responseText);
		},//end decode
		
		//generic ajax request
		request: function(o) {
			//set defaults
			Ext.applyIf(o, {
				fn_callback: function() { return true; },
				fn_failure: function(o) {
					mm.data.warning(o.errormessage, true);
					return false;
				},
				params: {}
			});
			//if(!o.params) o.params = {};			
			if(o.url) { s_path_request = o.url; }
			
			//keep session alive
			mm.session.reset();
			
			//make ajax call
			Ext.Ajax.request({
				//url: s_path_request,// + o.page,
				url: s_path_request + Ext.urlEncode(o.params),
				method: "POST",
				timeout: 30000,
				autoAbort: false,
				disableCaching: true,
				//params: o.params,
				success: function(o_response, o_options) {
					var o_r = mm.data.decode(o_response);
					//console.log(o_r);
					//if request is ok, then pass to fn_success
					if(o_r.condition && o_r.errorlevel == 0) {
						o.fn_success(o_r.result);
					}
					//if 401 message, redirect to login page
					else if(o_r.code == 401) {
						document.location.href = s_path_login;
					}
					//if error, then alert error message
					else {
						o.fn_failure(o_r);
					}
				},	
				failure: function(o_response, o_options) { o.fn_failure(o_response); },
				callback: function(o_options, b_success, o_response) { o.fn_callback(o_response); },
				listeners: {
					requestexception: function(c, response, o) {
						console.log(response);
					}
				}
			});
			
		},//end request
		
		//warning
		warning: function(s_msg, b_show) {
			var el = Ext.get('warning_bar');
			//show warning
			if(b_show) {
				Ext.getDom('warning_msg').innerHTML = s_msg;
				//slide in...
				el.slideIn('t', {
					easing:'easeOut', 
					duration:0.5,
					callback: function() {
						setTimeout(mm.data.warning, 4000);
					}
				});
			}
			//hide warning
			else {
				Ext.getDom('warning_msg').innerHTML = '';
				el.slideOut('t', {easing:'easeOut', duration:0.2});
			}
		}//end warning
		
	};//end return
}();//end data

/*****************************************************************
			=== ENTRY BAR ===
*****************************************************************/
mm.entry = function() {
	return {
		//initialize entry bar
		s_entry_id:'',
		b_in_entry:false,
		init: function() {
			mm.entry.frm_entry = new Ext.form.NumberField({
				emptyText:'weight',
				emptyClass:'blank',
				applyTo:'frm_value',
				value:'',
				name:'frm_value',
				listeners: {
					//check for special keys
					specialkey: function(f, e) {
						//on enter, save
						if(e.getKey()==e.ENTER) {
							if(!Ext.isEmpty(f.getValue)) {
								mm.entry.add(
									{metricid:Ext.getDom('entry_bar').getAttribute('mid'), value:f.getValue(), event:'entry.create'}, 
									Ext.getDom('entry_bar').getAttribute('tid')
								);
							}
							else {
								Ext.Msg.alert("Note", "You must enter a value before you can submit");
							}
						}
						//on escape, hide
						else if(e.getKey()==e.ESC) {
							f.reset();
						}
					}
				}
			});
			
			//entry after events
			Ext.get('entry_after').on({
				'mouseover': {
					fn: function() {
						clearTimeout(mm.entry.entry_after_timeout);
					}
				},
				'mouseout': function() {
					if(mm.entry.b_in_entry) {
						clearTimeout(mm.entry.entry_after_timeout);
						mm.entry.slideOut(3000);
					}
				}
			});
			
			//undo after event
			Ext.get('entry_after_undo').on('click', 
				function(e, o) { 
					mm.entry.undo();
					//clearTimeout(mm.entry.entry_after_timeout);
					//mm.entry.slideOut(0);
				}
			);
			
			//journal after bar
			Ext.get('entry_after_journaler').on('click', 
				function(e, o) { 
					mm.hash.rite('journal');
					mm.incentivisor.get();
					card_layout.layout.setActiveItem('card_journal');
					clearTimeout(mm.entry.entry_after_timeout);
					mm.entry.slideOut(0);
				}
			);
			
			//add over classes
			Ext.get('entry_after_add').addClassOnOver('over');
			Ext.get('entry_after_undo').addClassOnOver('over');
			Ext.get('entry_after_journaler').addClassOnOver('over');
			
			//location icon
			Ext.get('cnt_location').on('click', 
				function(e, o) {
					switch(o.className) {
						case '':
						case 'off':
							if(o.getAttribute('roam') != '1') {
								o.className = 'roam';
								o.setAttribute('roam', '1'); //set identifier to store that it has been searched
								//if error returning location (user disabled or not supported)
								if(!navigator.geolocation && o_location == false) {
									o.className = 'kill'; //no case for kill
								}
								//geo works fine, so get coordinates
								else {
									if(o_location == '') {
										console.log('txt');
										//get location
										mm.geo.getLocation(
											function(o_params) {
												o.className = 'on';
												o_location = o_params;
												mm.entry.b_location = true;
												o.setAttribute('lon', o_params.coords.longitude);
												o.setAttribute('lat', o_params.coords.latitude);
											},
											function() {
												o.className = 'kill';
												o_location = false;
											}
										);
									}
									else if(o_location != false) {
										o.setAttribute('lon', o_location.coords.longitude);
										o.setAttribute('lat', o_location.coords.latitude);
										o.className = 'on';
									}
								}
							}
							//if roamed before, then just swith it on
							else {
								o.className = 'on';
							}
							break;
						case 'on':
						case 'roam':
							o.className = 'off';
							break;
					}
				}
			);
			
			var el_metric_drop = Ext.get('entry_drop');
			Ext.getBody().on('click', 
				function(e, o) {
					//check if clicked in/outside entry_after 
					if(mm.entry.b_in_entry) {
						var a = ['entry_after','entry_after_inner','entry_after_msg','entry_after_undo','entry_after_add','entry_after_journaler'];
						//if clicked outside, then slideout
						if(a.indexOf(o.id)==-1) {
							clearTimeout(mm.entry.entry_after_timeout);
							mm.entry.slideOut(0);
						}
					}
					//check if clicked outside metric dropdown
					else if(mm.entry.b_metric_drop && o.id != 'cnt_arrow') {
						if(!Ext.get(o).hasClass('drop_entry')) {
							el_metric_drop.slideOut('t', {easing:'easeOut', duration:0.2});
							mm.entry.b_metric_drop = false;
						}
					}
				}
			);
			
		},//end init
		
		//add entry
		add: function(o_params, metric_name) {
			mm.entry.s_entry_id = '';
			Ext.getDom('entry_after_msg').innerHTML = '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Saving...';
			var el_entry_after = Ext.get('entry_after');
			el_entry_after.addClass('save');
			//slide in...
			el_entry_after.slideIn('t', {
				easing:'easeOut', 
				duration:0.5
			});
			mm.entry.frm_entry.disable();
			//get location params
			var el_location = Ext.getDom('cnt_location');
			o_params.showReloadGroupings = 1;
			if(el_location.className=='on') {
				o_params.lon = el_location.getAttribute('lon');
				o_params.lat = el_location.getAttribute('lat');
			}
			
			//send request
			mm.data.request({
				params: o_params,
				fn_success: function(o) {
					el_entry_after.removeClass('save');
					mm.entry.b_in_entry = true;
					mm.entry.s_entry_id = o.id;
					mm.entry.frm_entry.setValue('');
					//set msg txt
					Ext.getDom('entry_after_msg').innerHTML = 'Entered ' + o_params.value + ' for ' + metric_name;
					//call slideout with timeout
					mm.entry.slideOut(5000);
					
					//if showreloadgroupings is returned, reload the canvas
					if(s_curr_page && o.reloadgroupings) {
						mm.canvas.load(s_curr_page);
					}
					//Ext.Msg.alert("Note", "Entry has successfully been saved");
				},
				fn_failure: function(o) {
					mm.data.warning(o.errormessage, true);
					el_entry_after.hide();
					mm.entry.frm_entry.enable();
					mm.entry.frm_entry.focus();
				}
			});
		},//end add
		
		//assign boolean to metric drop
		metric_drop: function(b_switch) {
			mm.entry.b_metric_drop = b_switch;
			//console.log(mm.entry.b_metric_drop);
		},
		
		//slideout entry after
		slideOut: function(s_time) {
			mm.entry.entry_after_timeout = (function(){
				Ext.get('entry_after').slideOut('t', {
					easing:'easeOut', 
					duration:0.3, 
					callback: function() {
						clearTimeout(mm.entry.entry_after_timeout);
						mm.entry.b_in_entry = false;
						mm.entry.frm_entry.enable();
						//console.log(mm.entry.frm_entry);
						//mm.entry.frm_entry.focus(true);
					} 
				});
			}).defer(s_time);
		},//end slideOut
		
		//undo
		undo: function() {
			if(!Ext.isEmpty(mm.entry.s_entry_id)) {
				Ext.get('entry_after').addClass('save');
				Ext.getDom('entry_after_msg').innerHTML = '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Undoing entry...';
				//delete current entry
				mm.data.request({
					params: {event:'entry.delete', entryid:mm.entry.s_entry_id},
					fn_success: function(o) {
						Ext.getDom('entry_after_msg').innerHTML = '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Your entry has been successfully undone';
						mm.entry.slideOut(5000);
						Ext.getDom('incentivisor_txt').innerHTML = o.body;
					}
				});
			}
		}
	};//end return
}();//end entry


/*****************************************************************
			=== GEO FUNCTIONS ===
*****************************************************************/
mm.geo = function() {
	return {
		//error getting location
		errorLocation: function() {
			o_location = false;
		},//end errorlocation
		
		//get location
		getLocation: function(fn_success, fn_error) {
			if (navigator.geolocation) {
				navigator.geolocation.getCurrentPosition(fn_success, fn_error);
			} else {
				return false;
			}
		},//end getlocation
		
		successLocation: function(o) {
			o_location = o;
		},//end successlocation
	};//end return
}();//end geo

/*****************************************************************
			=== HASH FUNCTIONS ===
*****************************************************************/
mm.hash = function() {
	return {
		//init
		goto: function(o_layout, o_tree) {
			if(!o_layout) { o_layout = card_layout; }
			if(!o_tree) { o_tree = mm.pages.o_nav_tree; }
			var a_hash = window.location.hash.split('/');
			if(Ext.isEmpty(a_hash[0])) { a_hash[0] = '#' + s_section; }
			if(a_hash.length && a_section.indexOf(a_hash[0].toLowerCase()) != -1) {
				//if pages
				if(a_hash[0] == '#page') {
					if(a_hash[1] != undefined) {
						if(mm.pages.o_page[a_hash[1]]== undefined) {
							alert('404');
						}
						else {
							//load page
							mm.pages.loadPage(mm.pages.o_page[a_hash[1]], true, o_tree, o_layout);
						}
					}
					//load first child in page list
					else {
						mm.pages.loadPage(o_tree.root.firstChild.id, true, o_tree, o_layout);
					}
				}
				//if NOT pages
				else {
					mm.incentivisor.get();
					o_layout.layout.setActiveItem('card_' + a_hash[0].substring(1));
				}
			}
			else
			 {
				alert('404');
			}
			
		},//end find
		
		//load section/sub section
		load: function() {
			
		},
		
		//write url hash
		rite: function(s_hash) {
			window.location.hash = s_hash;
		},
		
		//set title
		setTitle: function(s_title) {
			document.title = 'MyMe - ' + s_title;
			s_curr_title = s_title;
		}
		
	};//end return
}();//end hash


/*****************************************************************
			=== INCENTIVISOR FUNCTIONS ===
*****************************************************************/
mm.incentivisor = function() {
	return {
		//get incentivisor
		get: function(s_page_id) {
			var o_params = { section:s_section, event:'analytics.incentivisor' };
			if(s_page_id) {
				o_params.pageid = s_page_id;
			}
				
			mm.data.request({
				params: o_params,
				fn_success: function(o) {
					Ext.getDom('incentivisor_txt').innerHTML = o.body;
				}
			});
		},//end get
		
		//close incentivisor
		close: function() {
			Ext.get('incentivisor').hide();
		}
		
	};//end return
}();//end hash


/*****************************************************************
			=== JOURNAL ===
*****************************************************************/
mm.journal = function() {
	return {
		o_grid_journal: {},
		//metric grid
		buildGrid: function() {
			//proxy
			var proxy = new Ext.data.HttpProxy({
				api: {
					read : {url: s_path_request + 'event=entry.list', method:'GET'},
					update: {url: s_path_request + 'event=entry.edit', method:'GET'},
					destroy: {url: s_path_request + 'event=entry.delete', method:'GET'}
				},
				listeners: {
					beforewrite: function(o, action, data, response, store, options) {
						console.log('txt');
						console.log(action);
						console.log(data);
						console.log(options);
					}
				}
			});
			//console.log(proxy);
					
			var reader = new Ext.data.JsonReader({
					idProperty: 'entryid',
					root:'result.entries'
				}, 
				[
					{name: 'metric', type: 'string'},
					{name: 'tags', type: 'string'},
					{name: 'value', type: 'int'},
					{name: 'date', type: 'date'},
					{name: 'hasgeo', type: 'boolean'},
					{name: 'source', type: 'string'}
			]);
			//writer
			var writer = new Ext.data.JsonWriter({
				encode: true,
				returnJson: true
			});

			//store
			var store = new Ext.data.GroupingStore({
				id: 'o_store_journal',
				//restful: true,
				proxy: proxy,
				groupField: 'date',
				sortInfo: { field:'date', direction:'ASC'},
				reader: reader,
				writer: writer,
				remoteSort:true,
				listeners: {
					beforeload: function(s, o) {
						/*

												var a_group = ['metric']; //array of values to group by
												var a_ungroup = ['value']; //array of values to ungroup
												//var s_field = g.colModel.config[index].dataIndex;
												var s_field = o.params.sort;
												console.log(s_field);
												console.log(o.params.dir);
												
												//if grouping by a specific column
												if(a_group.indexOf(s_field)!=-1) {
													mm.journal.groupSort(s_field, true);
												}
												//disable grouping
												else if(a_ungroup.indexOf(s_field)!=-1) {
													mm.journal.ungroupSort();
												}
												//default grouping by date
												else {
													mm.journal.groupSort('date');
												}
												*/
						
					},
					load: function(o_store, o_rec, o_options) {
						//create customized paging
						var i_num_pages = o_store.reader.jsonData.result.listmeta.pages;
						var i_curr_page = o_store.reader.jsonData.result.listmeta.page;
						var i_max = 10; //max number of pages to show
						var i_front = 5; //numbers in front of current
						var i_back = 4; //numbers behind current
						var i_page_first = 1; //first page
						var i_page_last = i_num_pages; //last page

						if(i_num_pages > i_max) {
							if(i_num_pages < (i_curr_page+i_front)) {
								i_page_first = i_curr_page - ((i_front - (i_num_pages-i_curr_page)) + i_back);
							}
							else if((i_curr_page-i_back) < 1 && i_num_pages > i_max) {
								var i_temp = (i_back-(i_curr_page-1));
								if((i_curr_page+i_temp+i_front) < i_num_pages) {
									i_page_last = i_curr_page+i_temp+i_front;
								}
							}
							else {
								i_page_last = i_curr_page + i_front;
								i_page_first = i_curr_page - i_back;
							}
						}
						
						Ext.DomHelper.overwrite('t_pager', '');
						var i_add_width = 0;
						
						if(i_page_first != 1) {
							var e_first = Ext.DomHelper.append('t_pager',{tag:'li',id:'p_first',html:'<span>&laquo;</span>', cls:'link'});
							Ext.get(e_first).on("click", function(e, o) { 
								mm.journal.o_grid_journal.toolbars[0].changePage(1);
							});
							Ext.DomHelper.append('t_pager',{tag:'li',html:'...'});
							i_add_width = 50;
						}
						for(var i=i_page_first; i<=i_page_last; i++) {
							var s_class = (i==i_curr_page) ? 'curr' : 'link';
							Ext.DomHelper.append(
								't_pager',
								{
									tag:'li',
									id:'p_' + i,
									p_index: i,
									cls:s_class,
									html: '<span>' + i + '</span>'
								}
							);
							Ext.get('p_'+i).on("click", function(e, o) { 
								var p_index = this.dom.getAttribute('p_index');
								o_store.load({params:{start:((p_index-1)*10), limit:10}});
								//mm.journal.o_grid_journal.toolbars[0].changePage(this.dom.getAttribute('p_index'));
							});
						}
						if(i_page_last != i_num_pages) {
							Ext.DomHelper.append('t_pager',{tag:'li',html:'...'});
							i_add_width += 50;
							var e_last = Ext.DomHelper.append('t_pager',{tag:'li',id:'p_last',html:'<span>&raquo;</span>', cls:'link'});
							Ext.get(e_last).on("click", function(e, o) {
								o_store.load({params:{start:((i_num_pages-1)*10), limit:10}});
								//mm.journal.o_grid_journal.toolbars[0].changePage(i_num_pages);
							});
						}
						
						var i_temp_pages = (i_num_pages > i_max) ? i_max : i_num_pages;
						var i_width = ((i_temp_pages + 2) * 26) + 30 + 1; //20 because it ignores the padding 10 (20 total) on both sides
						Ext.get('t_pager').setWidth(i_width + i_add_width);
					}
				}
			});

			store.on('update', function(s, r) {
				console.log('r');
			});
			
			/*
			//beforewrite
			Ext.data.DataProxy.addListener('beforewrite', function(proxy, action) {
			    alert('before');
			});

			//write
			Ext.data.DataProxy.addListener('write', function(proxy, action, result, res, rs) {
			    alert('write');
			});
			*/
			//console.log(mm.misc.agoDate(new Date()));
			//columns
			var columns =  new Ext.grid.ColumnModel([
				//the delete column
				{width:10, sortable:false, resizable:false, menuDisabled:true, renderer: 
					function() {
						return '&nbsp;';
					},
					editor: {
						xtype: 'displayfield',
						//add plugin for click event
						plugins: [ new Ext.DomObserver({
							click: function(evt, comp) {
								//delete record
								Ext.Msg.confirm('Confirm', 'Are you sure you want to do delete this record?', 
									function(btn) {
										if(btn == 'yes') {
											var selModel = mm.journal.o_grid_journal.getSelectionModel();
											var rec = selModel.getSelected();
											store.remove(rec);
										}
									}
								);
							}
						})]
						//TODO: Currently using a VERY ghetto(or ingenuous???) way for the delete icon through CSS. must find way to do it properly!!!
						//,html:'<div class="ico ico_delete" style="height:20px">y</div>'
					}
				},
				//{header:"Date", dataIndex:'date', resizable:false, sortable:true, renderer: Ext.util.Format.dateRenderer('l, F jS')},
				{header:"Date", dataIndex:'date', resizable:false, sortable: true,  width:40, 
					groupRenderer: Ext.util.Format.dateRenderer('l, F jS'), //use this group renderer so it groups it by date and NOT datetime specific
					renderer: function(value, cell, record) {
						var s_value = mm.misc.agoDate(value);
						return (s_value == undefined) ? value.format('g:iA') : s_value;
					},
					editor: {
						xtype: 'datefield',
						allowBlank: true,
						minValue: '01/01/2006',
						minText: 'Start date too early in time',
						maxValue: (new Date()).format('m/d/Y')
					}
				},
				{header: "Metric", width: 30, resizable:false, sortable: true, dataIndex: 'metric', editor: new Ext.form.TextField({})},
			    {header: "Value", width: 20, resizable:false, sortable: true, dataIndex: 'value',
					editor: new Ext.form.NumberField({
						allowBlank: false,
						allowNegative: false,
						style: 'text-align:left'
					})
				},
			    {header: "Tags", resizable:false, sortable:true, dataIndex: 'tags', editor: new Ext.form.TextField({})},
				{header: "Geo", resizable:false, sortable:true, dataIndex: 'hasgeo', width:20, editor:new Ext.form.Hidden({}),
					renderer: function(value, cell, record){
						return (value == 1) ? '<div class="has_geo" title="' + record.json.friendlyGeo + '"></div>' : '';
					}
				},
				{header:"Source", resizable:false, sortable:true, dataIndex: 'source', width:20, editor:new Ext.form.Hidden({}),
					renderer: function(value, cell, record) {
						return (value == 'web') ? '<div class="has_web"></div>' : '';
					}
				}
			]);

			//editor
			var editor = new Ext.ux.grid.RowEditor({
				saveText: 'save',
				cancelText:'cancel',
				clicksToEdit:1
			});

			//journal grid
			mm.journal.o_grid_journal = new Ext.grid.GridPanel({
				cls:'grid_journal',
				frame: true,
				autoScroll: true,
				hideCollapseTool:false,
				enableColumnHide: false,
				enableColumnMove:false,
				enableHdMenu:false,
				border:true,
				loadMask:true,
				width:719,
				forceLayout:true,
				height:440,
				//autoHeight:true,
				store: store,
				plugins: [editor],
				colModel: columns,
				//columns : columns,
				/*
				tbar: [{
					//delete button
					ref: '../removeBtn',
					text: 'Delete',
					iconCls: 'icon-user-delete',
					disabled: true,
					handler: function(){
						editor.stopEditing();
						var s = mm.journal.o_grid_journal.getSelectionModel().getSelections();
						for(var i = 0, r; r = s[i]; i++){
							store.remove(r);
						}
					}

				}, '-'],*/
				bbar: new Ext.PagingToolbar({
					pageSize: 10,
					store: store,
					displayInfo: false,
					html: '<ul id="t_pager"></ul><br class="brclear"/>'
				}),
				view: new Ext.grid.GroupingView({
					forceFit:true,
					showGroupName: false,
					enableNoGroups: false,
					enableGroupingMenu: false,
					hideGroupedColumn: false,
					groupTextTpl: '{[fm.date(values.gvalue,"l, F jS")]}'
				}),
				listeners: {
					/*
					cellclick: function(g,rowIndex,colIndex,e){
						var selModel = this.getSelectionModel();
						var rec = selModel.getSelected();
						if(colIndex==0)
							alert('delete!');
					}
					*/
					headermousedown: function(g, index, e) {
						/*
						var a_group = ['metric']; //array of values to group by
						var a_ungroup = ['value']; //array of values to ungroup
						var s_field = g.colModel.config[index].dataIndex;
						console.log(s_field);
						
						//if grouping by a specific column
						if(a_group.indexOf(s_field)!=-1) {
							mm.journal.groupSort(s_field);
						}
						//disable grouping
						else if(a_ungroup.indexOf(s_field)!=-1) {
							mm.journal.ungroupSort()
						}
						//default grouping by date
						else {
							mm.journal.groupSort('date');
						}
						*/
					}
				}
			});//end mm.journal.o_grid_journal
			
			//make sure delete/remove button is only active when a row is selected
			/*
			mm.journal.o_grid_journal.getSelectionModel().on('selectionchange', function(sm){
							mm.journal.o_grid_journal.removeBtn.setDisabled(sm.getCount() < 1);
						});*/
			
		},//end buildGrid
		
		init: function() {
			//make journal link active
			Ext.get('link_journal').on("click", 
				function(e, o) {
					mm.hash.rite('journal');
					mm.incentivisor.get();
					card_layout.layout.setActiveItem('card_journal');
				}
			);
			
			mm.journal.buildGrid();
		},//end init
		
		//sort as a grouped view
		groupSort: function(s_field, b_hide) {
			if(!b_hide) { b_hide = false; }
			var g = mm.journal.o_grid_journal;
			//show index 2 (time)
			g.colModel.setHidden(2, b_hide);
			//group by field
			g.store.groupBy(s_field);
		},
		
		//sort as an ungrouped view
		ungroupSort: function() {
			var g = mm.journal.o_grid_journal;
			//hide index 2 (time)
			g.colModel.setHidden(2, true);
			//clear groupings
			g.store.clearGrouping();
		}
		
	};//end return
}();//end journal

/*****************************************************************
			=== MASK FUNCTIONS ===
*****************************************************************/
mm.mask = function() {
	return {
		o: {},
		hide: function(s_mask) {
			mm.mask.o[s_mask].destroy();
			mm.mask.o[s_mask].hide();
		},//hide
		show: function(s_mask, o_el, s_msg) {
			if(s_msg == undefined) {
				s_msg = "Loading...";
			}
			mm.mask.o[s_mask] = new Ext.LoadMask(o_el, {msg:s_msg, removeMask:true});
			mm.mask.o[s_mask].show();
		}//show
	};//end return
}();//end mask

/*****************************************************************
			=== METRIC FUNCTIONS ===
*****************************************************************/
mm.metric = function() {
	return {
		o_tree: {},
		o_tree_editor: {},
		init: function(o) {
			mm.metric.el_editor = Ext.get('mymetrics_editor');
			mm.metric.el_input = Ext.get('input_editor_metrics');
			mm.metric.el_shadow = new Ext.Shadow({mode:'frame'});
			
			mm.metric.c_input = new Ext.form.TextField({
				applyTo:'input_editor_metrics',
				id:'cmp_input_editor_metrics',
				listeners: {
					specialkey: function(f, e) {
						//on enter, save
						if(e.getKey()==e.ENTER) {
							mm.metric.save(mm.metric.o_tree.getSelectionModel().selNode, f.getValue());
						}
						//on escape, hide
						else if(e.getKey()==e.ESC) {
							mm.metric.cancel();
						}
					}
				}
			});
			
			mm.metric.o_tree = new Ext.tree.TreePanel({
				//useArrows: true,
				//ddAppendOnly:true,
				border: false,
				hideCollapseTool:true,
		        autoScroll: true,
				renderTo:'mymetrics_container',
		        animate: true,
		        enableDD: true,
				//expanded:true,
		        containerScroll: true,
		        //dataUrl: 'treetest.html',
				rootVisible:false,
				//preloadChildren:false,
		        root: {
		            nodeType: 'async',
		            text: 'Ext JS',
		            draggable: false,
		            id: '',
					children: mm.viz.o_store_metric
		        },
				listeners: {
					click: function(n) {
						mm.metric.editor_hide();
					},
					dblclick: function(n) {
						mm.metric.editor_show(n); //show editor
						//console.log(xy);
						//console.log(n);
						//mm.metric.o_tree_editor.triggerEdit(n);
					},
					startdrag: function() {
						mm.metric.editor_hide();
					}
				}
		    });
		
			
			
			
			//button listeners
			Ext.get('btn_editor_metric_save').on('click', 
				function(e, o) { 
					mm.metric.save(mm.metric.o_tree.getSelectionModel().selNode, mm.metric.c_input.getValue())
					//Ext.getCmp('mymetrics_editor').completeEdit();
				}
			);
			
			Ext.get('btn_editor_metric_cancel').on('click', 
				function(e, o) {
					mm.metric.cancel();
					//Ext.getCmp('mymetrics_editor').cancelEdit(true);
				}
			);
		
			mm.metric.o_tree.getRootNode().expand(true);
			/*
			mm.metric.o_tree_editor = new Ext.tree.TreeEditor(mm.metric.o_tree, {}, {
				id:'mymetrics_editor',
				//completeOnEnter:false,
				//cancelOnEsc:false,
				allowBlank: false,
				editDelay:0,
		        blankText: 'Title...',
				contentEl:'editor_metrics_btns',
		        selectOnFocus: true,
				maxWidth:250,
				plugins:[new Ext.ux.tree.TreeEditor({})],
				listeners: {
					canceledit: function(o, s_new, s_old) {
						console.log('cancel');
					},
					complete: function(o, s_new, s_old) {
						console.log('complete');
					}
				}
			});
		//textureTreeEditor.triggerEdit();
			//save call				
			
			
			/*
			*/
			
		},//init
		
		//cancel metric
		cancel: function() {
			mm.metric.editor_hide();
		},//end cancel
		
		//save metric
		save: function(n, s_name) {
			//save call
			mm.data.request({
				params: { metricid:n.id, name:s_name, event:'metric.edit' },
				fn_success: function(o) {
					n.setText(s_name);
					mm.metric.editor_hide();
				}
			});
		},//end save
		
		//hide metric editor
		editor_hide: function() {
			mm.metric.el_shadow.hide();
			mm.metric.el_editor.hide();
			mm.metric.c_input.setValue('');
			//mm.metric.el_input.dom.value = '';
		},//save editor_hide
		
		//show metric editor
		editor_show: function(n) {
			var el = Ext.get(n.ui.elNode); //get el node
			var xy = el.getXY();
			mm.metric.el_editor.setXY([xy[0]+105, xy[1]+15]);
			mm.metric.el_editor.show(); //show editor
			mm.metric.el_shadow.show(mm.metric.el_input); //show shadow
			//mm.metric.el_input.dom.value = n.text;
			mm.metric.c_input.setValue(n.text);
			mm.metric.el_input.dom.focus();
			mm.metric.el_input.dom.select();
		}//save editor_show
		
		
	};//end return
}();//end metric

/*****************************************************************
			=== MISC FUNCTIONS ===
*****************************************************************/
mm.misc = function() {
	return {
		//change time to 'ago' time (only works for datetime in the same month)
		agoDate: function(time){
			time = time.format('Y-m-d\\TH:i:s\\Z');
			var date = new Date((time || "").replace(/-/g,"/").replace(/[TZ]/g," ")),
					diff = (((new Date()).getTime() - date.getTime()) / 1000),
					day_diff = Math.floor(diff / 86400);

				if ( isNaN(day_diff) || day_diff < 0 || day_diff >= 31 ) {
					return;
				}

				return day_diff == 0 && (
						diff < 60 && "just now" ||
						diff < 120 && "1 minute ago" ||
						diff < 3600 && Math.floor( diff / 60 ) + " minutes ago" ||
						diff < 7200 && "1 hour ago" ||
						diff < 86400 && Math.floor( diff / 3600 ) + " hours ago") ||
					day_diff == 1 && "Yesterday" ||
					day_diff < 7 && day_diff + 1 + " days ago" ||
					day_diff < 31 && Math.ceil( day_diff / 7 ) + " week(s) ago";
		}//end agoDate
		
	};//end return
}();//end misc

/*****************************************************************
			=== MOOD FUNCTIONS ===
*****************************************************************/
mm.mood = function() {
	return {
		o_slider_mood: {},
		//build Mooder
		buildMooder: function(){
			//tooltip plugin for slider
			var tip = new Ext.slider.Tip({
				getText: function(thumb){
					var msg;
					switch(thumb.value) {
						case 1:
							msg = "sad";
							break;
						case 2:
							msg = "bad";
							break;
						case 3:
							msg = "ok";
							break;
						case 4:
							msg = "good";
							break;
						case 5:
							msg = "happy";
							break;
					}
					return msg;
				}
			});
			
			//mood slider
			mm.mood.o_slider_mood = new Ext.Slider({
				renderTo: 'slider_mooder',
				width: 105,
				value: 3,
				increment: 1,
				minValue: 1,
				maxValue: 5,
				plugins: tip,
				listeners: {
					dragstart: function(o, e) {
						//Ext.get('mood_box').show();
					},
					dragend: function(o, e) {
						//open mooder
						Ext.get('mood_divider').shift({height:94, 
							callback: function() {
								Ext.get('mood_extra').setStyle('display', 'block');
								Ext.getDom('txt_mood').focus();
								Ext.getDom('txt_mood').select();
							}
						});
						var el = Ext.get('mooder');
						//el.dom.className = '';
						/*
						switch(o.thumbs[0].value) {
							case 1:
								//el.addClass('mood_bad');
								//el.dom.setAttribute('mood', 'bad');
								break;
							case 2:
								//el.addClass('mood_ok');
								//el.dom.setAttribute('mood', 'ok');
								break;
							case 3:
								//el.addClass('mood_good');
								//el.dom.setAttribute('mood', 'good');
								break;
							case 4:
								//el.addClass('mood_good');
								//el.dom.setAttribute('mood', 'good');
								break;
							case 5:
								//el.addClass('mood_good');
								//el.dom.setAttribute('mood', 'good');
								break;
						
						}*/
					},
					render: function(o, e) {
						//save button click listener
						Ext.get('mood_save').on("click", function(e, o) { 
							mm.mood.save();
						});
						//cancel button click listener
						Ext.get('mood_cancel').on("click", function(e, o) { 
							mm.mood.reset();
						});
					}
				}
			});

		},//end buildMooder
		
		//collapse mooder box
		collapse: function(b_reset) {
			Ext.get('mood_extra').setStyle('display', 'none');
			Ext.get('mood_divider').shift({height:4});
			mm.mood.o_slider_mood.setValue(3);
			
			if(b_reset) {
				var el_txt = Ext.get('txt_mood_container');
				el_txt.removeClass('thanks');
				Ext.getDom('txt_mood').value = '';
				el_txt.show();
			}
		},//end collapse
		
		collapseanim: function() {
			mm.mood.collapse(true);
		},
		
		//init
		init: function() {
			mm.mood.buildMooder();
		},//end init
		
		//reset
		reset: function() {
			var el = Ext.get('mooder');
			//mm.mood.o_slider_mood.setValue(parseInt(el.dom.getAttribute('mood_index')));
			mm.mood.collapse();
		},//end reset
		
		//save
		save: function() {
			var el_txt = Ext.get('txt_mood_container');
			var s_feedback = Ext.getDom('txt_mood').value;
			var i_mood = mm.mood.o_slider_mood.getValue();
			
			//save call				
			mm.data.request({
				params: { section:s_section, mood:i_mood, feedback:s_feedback, event:'analytics.feedback' },
				fn_success: function(o) {
					Ext.getDom('mooder').setAttribute('mood_index', i_mood);
					Ext.getDom('txt_mood').value = '\n         THANK YOU';
					el_txt.addClass('thanks');
					el_txt.fadeOut({endOpacity:0, duration:1, callback:mm.mood.collapseanim});
					//mm.mood.collapse();
				}
			});
			
		}//end save
	};//end return
}();//end misc



/*****************************************************************
			=== PAGES ===
*****************************************************************/
mm.pages = function() {
	return {
		o_page: {}, //map pagename to id
		o_input_page_new: {},
		o_nav_tree: {},
		o_nav_tree_editor:{},
		o_tt_page: {},
		//build nav
		buildNav: function(o) {
			mm.pages.o_nav_tree = new Ext.tree.TreePanel({
			    renderTo: 'nav',
			    useArrows: true,
			    animate: false,
			    enableDD: true,
				expanded:true,
			    border: false,
				rootVisible:false,
				ddGroup:'pDD',
				//preloadChildren: true,
			    //dataUrl: s_path_request + '/pages/list.html',
			    root: {
			        nodeType: 'async',
			        draggable: false,
					id:'rsource',
					children: o
			    },
				listeners: {
					//after nav is rendered
					afterrender: function() {
						mm.contentLayout.init(this);
						//remove mask
						//mm.mask.hide('pages');
						//load first nav link
						//mm.pages.loadPage(this.root.firstChild.id, true, this);
					},
					
					nodedragover: function() {
						console.log('node over!');
					},
					
					//note that getting the selectednode on "click" gets the previously selected node! <<< use later!!!
					//onclick
					click: function(n, t) {
						mm.hash.rite('page/'+n.attributes.slug);
						//mm.pages.loadPage(n.id);
					},
					
					//when dragged end
					enddrag: function(t, n) {
						//edit call				
						mm.data.request({
							page: '/pages/edit.html',
							params: { id:n.id, name:n.text, event:'page.edit', sortorder:(t.root.indexOf(n) + 1) },
							fn_success: function(o) {
								//load page
								mm.pages.loadPage(n.id, true);
							}
						});
					}
				}
			});
			
			//new page editor
			mm.pages.o_nav_tree_editor = new Ext.tree.TreeEditor(mm.pages.o_nav_tree, {}, {
				allowBlank: false,
		        selectOnFocus: true,
				maxWidth:100,
				listeners: {
					//save page
					complete: function(o, value, start_value) {
						//only add when not empty
						if(!Ext.isEmpty(value) && value != 'New Page') {
							value = mm.pages.getUnique(value, mm.pages.o_nav_tree.root.childNodes.length); //mm.pages.o_nav_tree.root.indexOf(o.editNode));
							mm.pages.createPage(value, o.editNode);
						}
						//if empty, remove
						else {
							mm.pages.o_nav_tree.root.removeChild(o.editNode);
						}
						
					},
					//cancel page
					canceledit: function(o) {
						mm.pages.o_nav_tree.root.removeChild(o.editNode);
					}
				}
			})
			
			//when the delete link is clicked...
			Ext.get('nav').on("click", 
				function(e, o) {
					mm.pages.deletePage(o);
				}, this, {delegate: ".x-tree-ec-icon"}
			);
			
		},//end buildNav
		
		//TOOLTIP create new page
		buildTooltip: function() {

			mm.pages.o_tt_page = new Ext.ux.CTip({
			    target: 'page_new',
		        html: '<div id="tt_page_new"><h1>Page Name:</h1>' + 
							'<div>' +
								'<em id="tt_page_new_input"></em>' +
							'</div>' +
							'<span class="ico ico_accept" id="save_page_new">save</span>' +
							'<br class="brclear">' +
						'</div>',
		        autoHide: false,
		        closable: true,
		        draggable:false,
				anchor: 'left',
				showDelay:0,
				id:'tt_page_new_tip',
				width:360,
				listeners: {
					//focus everytime it's shown
					show: function() {
						mm.pages.o_input_page_new.focus();
					},
					
					//after it's rendered...
					afterrender: function() {
						//add ext input field
						mm.pages.o_input_page_new = new Ext.form.Field({
							renderTo:'tt_page_new_input',
							name:'tt_page_new_input',
							allowBlank:false,
							listeners: {
								//check for special keys
								specialkey: function(f, e) {
									//on enter, save
									if(e.getKey()==e.ENTER) {
										mm.pages.createPage(f.getValue());
									}
									//on escape, hide
									else if(e.getKey()==e.ESC) {
										mm.pages.o_tt_page.hide();
									}
								}
							}
						});
						
						//add event to create page
						Ext.get('save_page_new').on('click', function(){
							mm.pages.createPage(mm.pages.o_input_page_new.getValue());
						});
					},
					
					//when closed...
					hide: function() {
						mm.pages.o_input_page_new.reset();
					}
				}
		    });//end new page tooltip
		},//end buildTooltip
		
		//create page
		createPage: function(s_name, o_node) {
			/*
			if(Ext.isEmpty(s_name)) {
				mm.pages.o_input_page_new.markInvalid();
			}
			else {
			*/
				
				//create call				
				mm.data.request({
					params: { name:s_name, event:'page.create', sortorder:mm.pages.o_nav_tree.root.childNodes.length-1 },
					fn_success: function(o) {
						mm.pages.o_page[o.slug] = o.id;
						o_node.attributes.slug = o.slug;
						o_node.attributes.editable = false;
						o_node.setText(s_name);
						o_node.setId(o.id); //change id to match new correct id of page
						//mm.pages.o_nav_tree.root.appendChild({"text":s_name,"leaf":true,"cls":"folder","id":o.id, "slug":o.slug});
						//mm.pages.o_nav_tree.getLoader().load(mm.pages.o_nav_tree.root); //<<--- refreshes data on server
						//mm.pages.o_tt_page.hide();
						mm.hash.rite('page/'+o.slug);
						//mm.pages.loadPage(o.id, true);
					},
					fn_failure: function(o) {
						o_node.remove(true);
					}
				});
				
			//}
		},//end createPage
		
		
		//delete page
		deletePage: function(o) {
			//get div of tree node
			var el = Ext.get(o).parent();
			var el_text = Ext.DomQuery.selectNode('a span', el.dom).innerHTML;
			//if(el.dom.getAttribute('ext:tree-node-id') == s_curr_page) {
			//	mm.pages
			//}
			
			if(mm.pages.o_nav_tree.root.childNodes.length > 1) {
				Ext.MessageBox.confirm('This action cannot be undone', 'Are you sure you want to delete the page: <em class="bold">' + el_text + '</em>?', 
					function(btn){
						if(btn == 'yes') {
							//animate node out and remove it
							el.ghost('l', {
								easing:'easeOut',
								duration:0.5, 
								remove:true, 
								callback: function() { 
									var o_id = mm.pages.o_nav_tree.getNodeById(el.getAttribute('ext:tree-node-id'));
									//delete call				
									mm.data.request({
										page: '/pages/delete.html',
										params: { id: o_id.id, event:'page.delete' },
										fn_success: function(o) {
											//if selected page is the one being removed, then select next or first child
											if(mm.pages.o_nav_tree.selModel.selNode && mm.pages.o_nav_tree.selModel.selNode.id == o_id.id) {
												if(o_id.nextSibling) {
													mm.pages.loadPage(o_id.nextSibling.id, true, false, false, true);
												}
												else {
													mm.pages.loadPage(mm.pages.o_nav_tree.root.firstChild.id, true, false, false, true);
												}
											}
											o_id.remove();
										}
									});
								}
							});
						}
					}
				);
			}
			else {
				Ext.Msg.alert("Note", "You cannot delete all pages!");
			}
			
		},//end deletePage
		
		//deselect page
		deselectPage: function() {
			//unselect tree node
			if(mm.pages.o_nav_tree.selModel && mm.pages.o_nav_tree.selModel.selNode) {
				mm.pages.o_nav_tree.selModel.selNode.unselect(true);
			}
		},//end deselectPage
		
		//editPage
		editPage: function(s_id, s_name) {
			//edit call				
			mm.data.request({
				page: '/pages/edit.html',
				params: { id:s_id, name:s_name, event:'page.edit' },
				fn_success: function(o) {
					var node = mm.pages.o_nav_tree.getNodeById(s_id);
					//var s_slug = node.attributes.slug;
					mm.pages.o_page[o.slug] = s_id;
					node.attributes.slug = o.slug;
					mm.hash.rite('page/' + o.slug);
					node.setText(s_name);
					Ext.get("page_title_text").dom.innerHTML = s_name;
					Ext.getCmp('card_page_title').layout.setActiveItem('page_display_title');
				}
			});
		},//end editPage
		
		//get unique page name
		getUnique: function(s_name, s_index) {
			var i_name = 1;
			var a = mm.pages.o_nav_tree.root.childNodes;
			console.log(s_index);
			a.splice(s_index, 1); //remove item at index
			var b = false;
			while(b==false) {
				var a_text = [];
				Ext.each(a,function(o,i){
					a_text.push(o.text);
				}, this);
				//if not found in the array, then exit
				if(a_text.indexOf(s_name)==-1) {
					b = true;
					return s_name;
				}
				//if found, then attach a (+1) and start over to see if found again
				else {
					s_name += ' (' + i_name + ')';
					i_name++;
				}
			}
		},//end getunique
		
		//init
		init: function() {
			//list pages
			mm.pages.listPages();
			
			//event on new page link
			Ext.get('page_new').on('click', 
				function(e, o) {
					var node = mm.pages.o_nav_tree.root.appendChild({text: 'New Page', leaf: true, editable:true, slug:''});
					mm.pages.o_nav_tree_editor.triggerEdit(node);
				}
			);
			//mm.pages.buildNav();
			//mm.pages.buildTooltip();
		},//end init
		
		listPages: function() {
			//add mask
			//mm.mask.show('pages', 'nav');
			
			//list call		
			mm.data.request({
				page: '/pages/list.html',
				params: {event:'page.list'},
				fn_success: function(o) {
					//make sure it has ext tree properties
					Ext.each(o.pages,function(o_item,i_index){
						o_item.text = o_item.name;
						o_item.leaf = true;
						o_item.editable = false;
						mm.pages.o_page[o_item.slug] = o_item.id;
					}, this);
					//build navigation
					mm.pages.buildNav(o.pages);
				}
			});
		},//end listPages
		
		//loadPage
		loadPage: function(s_id, b_select, o_tree, o_layout, b_hash) {
			if(!o_tree) { o_tree = mm.pages.o_nav_tree; }
			if(!o_layout) { o_layout = card_layout; }
				
			//get node
			var o_node = o_tree.getNodeById(s_id);
			
			//select tree node
			if(b_select) {
				o_node.select();
			}
			
			mm.hash.setTitle('My Pages/ ' + o_node.text);
			if(b_hash) {
				mm.hash.rite('page/' + o_node.attributes.slug);
			}
			else {
				//load canvas	
				mm.canvas.load(s_id);

				//get incentivisor
				mm.incentivisor.get(s_id);
			}
				
			s_curr_page = s_id;
			o_layout.layout.setActiveItem('card_page');
			Ext.get("page_title_text").dom.innerHTML = o_node.text;
			Ext.getCmp('card_page_title').layout.setActiveItem('page_display_title');
		}//end loadPage
		
	};//end return
}();//end mm.pages


/*****************************************************************
			=== SESSION FUNCTIONS ===
*****************************************************************/
mm.session = function() {
	return {
		//init
		init: function() {
			//event on resume link
			Ext.get('timeout_resume').on('click', 
				function(e, o) { 
					mm.session.reset(true);
					mm.mask.hide('session');
				}
			);
		},//end init
		
		//kill user's session
		killSession: function() {
			document.location.href = s_path_home;
		},//end killsession
		
		//reset timer
		reset: function(b_slide) {
			clearInterval(mm.session.i_interval);
			clearTimeout(mm.session.i_warning);
			clearTimeout(mm.session.i_timeout);
			mm.session.i_countdown = i_session_timeout / 1000;
			mm.session.i_warning = mm.session.warning.defer(i_session_timeout);
			if(b_slide) {
				Ext.get('timeout_bar').slideOut('t', {easing:'easeOut', duration:0.4});
				mm.incentivisor.get(); //run an ajax request to keep session alive
			}
		},//end reset
		
		//update warning timer
		updateTimer: function() {
			Ext.getDom('timeout_time').innerHTML = mm.session.i_countdown;
			mm.session.i_countdown--;
		},//end updatetimer
		
		//warning
		warning: function() {
			mm.mask.show('session', Ext.getBody(), 'Session timing out...'); //show mask
			mm.session.i_countdown = i_session_warning / 1000; //get seconds from the milliseconds
			Ext.get('timeout_bar').slideIn('t', {easing:'easeOut', duration:0.4 }); //slide out warning
			mm.session.i_interval = setInterval(mm.session.updateTimer, 1000); //update timer every second
			mm.session.i_timeout = mm.session.killSession.defer(i_session_warning); 
		}//end warning
	};//end return
}();//end misc


/*****************************************************************
			=== USER FUNCTIONS ===
*****************************************************************/
mm.user = function() {
	return {
		o_form_personal: {},
		o_tabs_user: {},
		s_default_msg_photo: '',
		//build user profile tabs
		buildTabs: function(time){
			mm.user.o_tabs_user = new Ext.TabPanel({
				activeTab: 0,
				width:735,
				//frame:true,
				defaults:{border: false},
				cls:'tab_user',
				border:true,
				bodyBorder:true,
				bodyStyle:'padding:10px; border-color:#dee4e8',
				items:[
					//Personal info
					{
						title: 'Personal Info', 
						layout:'column',
						defaults:{border: false},
						autoWidth:true,
						items: [
							{
								//columnWidth:.6,
								//width:400,
								items: [
									//{html:'blah blah', bodyStyle:'padding:20px', bodyCssClass: 'bggrey', border:false},
									mm.user.o_form_personal,
									{
										border:false,
										bodyStyle:'padding:20px 0 10px 0',
										html:'	<div id="btn_save_personal" class="btn_save fleft link"></div>' +
												'<div id="btn_cancel_personal" class="fleft">or <span class="link">Cancel</span></div>'
									}
								]
							},
							{
								bodyStyle:'margin-left:15px',
								//columnWidth:.4,
								border:false,
								html:'column 2 info here'
							}
						]
					},
					{title: 'Privacy', html:'privacy blah'},
					{title: 'Bundle Management', html:'bundle blah'},
					{
						title:'My Metrics',
						id:'tab_metrics',
						autoWidth:true,
						html:'<div id="mymetrics_container"></div>'
					}
				],
				listeners: {
					afterrender: function() {
						//when save personal link is clicked
						Ext.get('btn_save_personal').on("click", 
							function(e, o) { 
								//console.log(o);
							}
						);
						
						//when cancel personal link is clicked
						Ext.get('btn_cancel_personal').on("click", 
							function(e, o) { 
								mm.user.o_form_personal.findById('f_user_upload').setFieldLabel(mm.user.s_default_msg_photo);
								mm.user.o_form_personal.form.reset();
							}
						);
					},
					tabchange: function(o, t) {
						if(!o_render.metric_open && o.activeTab.id == 'tab_metrics') {
							o_render.metric_open = true;
							mm.metric.init();
						}
					}
				}
			});
			
		},//end buildTabs
		
		//build user personal info
		buildPersonalInfo: function() {
			mm.user.s_default_msg_photo = "You have no profile photo";
			
			//personal info form
			mm.user.o_form_personal = new Ext.FormPanel({
				labelAlign: 'top',
				bodyStyle:'padding:20px',
				border:false,
				width:457,
				bodyCssClass:'bggrey',
				items: [
					{
						xtype:'displayfield',
						id:'f_user_displayname',
						hideLabel:true,
						value:'MyMe User',
						cls:'txt_header'
					},
					{
						layout:'column', border:false, bodyCssClass:'bggrey',
						items:[
							//user photo
							{width:71, html:'<div id="f_user_photo"><img src="img/no_photo.png"></div>', border:false, bodyStyle:'padding:10px 10px 0 0', bodyCssClass:'bggrey'},
							//user file upload
							{columnWidth:0.7, border:false, layout:'form', bodyStyle:'padding:10px', bodyCssClass:'bggrey',
								items:[
									{	xtype:'fileuploadfield', buttonOnly:true, name:'fileupload', id:'f_user_upload', fieldLabel:mm.user.s_default_msg_photo, width:50, labelSeparator:'',
										listeners: {
											//when file is selected
											fileselected: function(btn, v) {
												btn.setFieldLabel('');
												mm.user.o_form_personal.findById('f_user_path').setValue(v);
											}
										}
									},
									{	xtype:'displayfield', id:'f_user_path', html:'no file selected', hideLabel:true, name:'f_user_filepath', style:'margin-top:-10px'}
								]
							}
						]
					},
					
					{
						layout:'column', border:false, 
						items:[
							{	width:183, border:false, layout:'form',
								items:[
									{
										xtype:'textfield',
										fieldLabel: 'Full Name',
										id:'f_fullname',
										name: 'fullname',
										anchor:'95%',
										enableKeyEvents:true,
										listeners: {
											//update username display as you type
											keyup: function(f, e) {
												var s_value = f.getValue();
												if(s_value.length > 2) {
													Ext.getDom('usr_error_name').innerHTML = 'Good choice!';
													Ext.getDom('usr_error_name').className = 'good';
												}
												else {
													Ext.getDom('usr_error_name').innerHTML = '';
													Ext.getDom('usr_error_name').className = '';
												}
												mm.user.o_form_personal.findById('f_user_displayname').setValue(s_value);
											}
										}
									},
									{
										xtype:'textfield',
										fieldLabel: 'Username',
										id:'f_username',
										name: 'username',
										anchor:'95%'
									},
									{
										xtype:'textfield',
										fieldLabel: 'Password',
										id:'f_password',
										name: 'password',
										inputType:'password',
										anchor:'95%',
										enableKeyEvents:true,
										listeners: {
											//on keyup check for password strength
											keyup: function(o, e) {
												var s_msg = 'You need ';
												var s_msg_pass = mm.user.passwordStrength(o.getValue());
												var el_pass = Ext.get('usr_error_password');
												if(s_msg_pass.length) {
													el_pass.dom.innerHTML = s_msg + s_msg_pass;
													el_pass.dom.className = 'bad';
												}
												else {
													el_pass.dom.innerHTML = 'Good password';
													el_pass.dom.className = 'good';
												}
												
											}
										}
									},
									{
										xtype:'textfield',
										fieldLabel: 'Location',
										id:'f_location',
										name: 'location',
										anchor:'95%'
									},
									{
										xtype:'combo',
										fieldLabel: 'Time Zone',
										store:o_store_timezones,
										forceSelection:true,
										typeAhead:false,
										triggerAction:'all',
										editable:false,
										selectOnFocus:true,
										f_timezone:'f_timezone',
										name: 'timezone',
										anchor:'95%'
									}
								]
							},
							{
								border:false, cls:'err_user', layout:'form',
								html:'<ul class="usr_error">' +
										'<li id="usr_error_name"></li>' +
										'<li id="usr_error_username"></li>' +
										'<li id="usr_error_password"></li>' +
									'</ul>'
							}
						]
					}
					
					
				],//end items
				
				listeners: {
					afterrender: function() {
						//load profile
						mm.data.request({
							params: { event:'member.profile' },
							fn_success: function(o) {
								mm.user.o_form_personal.getForm().setValues(
									{
										f_fullname: o.fullname,
										f_username: o.username,
										f_location: o.location,
										f_timezone: o.timezone
									}
								);
							}
						});
					}//end afterrender
				}//end listeners
			});
		},//end buildPersonalInfo
		
		//init
		init: function() {
			mm.user.buildPersonalInfo();
			mm.user.buildTabs();
		},//end init
		
		//test if password is strong
		passwordStrength: function(s_pass) {
			//var i_score   = 0;
			//var s_msg = "weak";
			var s_pass, s_msg="";

			// PASSWORD LENGTH
			/*
			if (s_pass.length<5) i_score = (i_score+3);
						else if (s_pass.length>4 && s_pass.length<8) i_score = (i_score+6);
						else if (s_pass.length>7 && s_pass.length<16) i_score = (i_score+12);
						else if (s_pass.length>15) i_score = (i_score+18);
						
						// LETTERS (Not exactly implemented as dictacted above because of my limited understanding of Regex)
						if (s_pass.match(/[a-z]/)) i_score = (i_score+1); //at least 1 lower case letter
						if (s_pass.match(/[A-Z]/)) i_score = (i_score+5); // [verified] at least one upper case letter
						if (s_pass.match(/\d+/)) i_score = (i_score+5); // [verified] at least one number
						if (s_pass.match(/(.*[0-9].*[0-9].*[0-9])/)) i_score = (i_score+5); // [verified] at least three numbers		

						// SPECIAL CHAR
						if (s_pass.match(/.[!,@,#,$,%,^,&,*,?,_,~]/)) i_score = (i_score+5); //[verified] at least one special character
						if (s_pass.match(/(.*[!,@,#,$,%,^,&,*,?,_,~].*[!,@,#,$,%,^,&,*,?,_,~])/)) i_score = (i_score+5); // [verified] at least two special characters

						// COMBOS
						if (s_pass.match(/([a-z].*[A-Z])|([A-Z].*[a-z])/)) i_score = (i_score+2); // [verified] both upper and lower case
						if (s_pass.match(/([a-zA-Z])/) && s_pass.match(/([0-9])/)) i_score = (i_score+2); // [verified] both letters and numbers						
						if (s_pass.match(/([a-zA-Z0-9].*[!,@,#,$,%,^,&,*,?,_,~])|([!,@,#,$,%,^,&,*,?,_,~].*[a-zA-Z0-9])/)) i_score = (i_score+2); // [verified] letters, numbers, and special characters

						if(i_score < 16) s_msg = "very weak";
						else if (i_score > 15 && i_score < 25) s_msg = "weak";
						else if (i_score > 24 && i_score < 35) s_msg = "mediocre";
						else if (i_score > 34 && i_score < 45) s_msg = "strong";
						else s_msg = "stronger";*/
			
			if(s_pass.length<6) { s_msg = "at least 6 characters!"; }
			//else if(!s_pass.match(/[a-z]/)) s_msg = "at least 1 lowercase letter!";
			//else if(!s_pass.match(/[A-Z]/)) s_msg = "at least 1 uppercase letter!";
			//else if(!s_pass.match(/\d+/)) s_msg = "at least 1 number!";
			//else if(!s_pass.match(/.[!,@,#,$,%,^,&,*,?,_,~]/)) s_msg = "at least 1 special character!";
			
			return s_msg;
		}//end passwordStrength
		
	};//end return
}();//end user


/*****************************************************************
			=== VISUALIZATIONS FUNCTIONS ===
*****************************************************************/
mm.viz = function() {
	
	return {
		a_li : [],
		o_selected_dt : '',
		o_selected_li: '',
		o_preset2metric: {},
		o_preset2category: {},
		o_populate: {},
		o_store_metric: {},
		s_action:'add',
		//init
		init: function() {
			//get metrics
			mm.data.request({
				params: {event:'metric.list'},
				fn_success: function(o) {
					//store metrics in combo store
					mm.viz.o_store_metric = o.metrics;
					
					//add metric dropdown in entry bar
					var s_html = '<li mid="{id}" class="drop_entry">{name}</li>';
					var tpl = new Ext.DomHelper.createTemplate(s_html);
					var el_bar = Ext.getDom('entry_bar');
					Ext.each(o.metrics,function(oy,i){
						//add text to store_metric for treepanel
						mm.viz.o_store_metric[i].text = oy.name;
						mm.viz.o_store_metric[i].leaf = true;
						//add atributes
						if(i==0) {
							el_bar.setAttribute('mid', oy.id);
							el_bar.setAttribute('tid', oy.name);
						}
						var el = tpl.append('entry_drop', {id: oy.id, name: oy.name}, true);
						el.on('click', 
							function(e, ox) { 
								//set metric id
								el_bar.setAttribute('mid', ox.getAttribute('mid'));
								el_bar.setAttribute('tid', ox.innerHTML);
								//change empty text to metric name
								mm.entry.frm_entry.emptyText = ox.innerHTML;
								//if(!Ext.isNumber(mm.entry.frm_entry.getValue()))
								mm.entry.frm_entry.setRawValue(ox.innerHTML);
								mm.entry.frm_entry.setValue('');
								//hide dropdown
								Ext.get('entry_drop').hide();
								mm.entry.metric_drop(false);
							}
						);
						el.addClassOnOver('over');
					}, this);
					
					//event on dropdown arrow
					Ext.get('cnt_arrow').on('click', 
						function(e, ox) { 
							var el = Ext.get('entry_drop');
							if(el.isVisible()) {
								el.slideOut('t', {easing:'easeout', duration:0.2, callback: function() { mm.entry.metric_drop(false); }});
							}
							else {
								el.slideIn('t', {easing:'easeOut', duration:0.4, callback: function() { mm.entry.metric_drop(true); }});
							}
						}
					);
				}
			});
			
			//create window
			mm.viz.o_win_viz = new Ext.Window({
				cls:'win_viz',
				shadow:false,
				frame:false,
				closable: false,
				layout:'fit',
				modal:true,
				draggable:false,
				resizable:false,
				width:800,
				height:520,
				closeAction:'hide',
				plain: false,
				html:'<div id="win_viz">' +
				'<div id="win_viz_container">' +
				'<div class="col1">' +
					'<span id="txt_metric"></span>' +
					'<input type="text" id="frm_viz_metric">' +
					'<div id="cnt_choose">' +
						'<dl id="category_list"></dl>' +
						'<ul id="preset_list"></ul>' +
						'<div class="brclear"></div>' +
					'</div>' +
				'</div>' +
				'<div class="col2">' +
					'<div id="preview_viz" class="hidden"><img id="preview_viz_img" src="img/viz_preview_blank.png"></div>' +
					'<div id="preview_legend" class="hidden"><table border=0><tr><td id="p_type"></td><td id="p_comp"></td></tr><tr><td id="p_term"></td><td>&nbsp;</td></tr></table></div>' +
					'<span id="preview_legend_txt"></span>' +
				'</div>' +
				'<div class="brclear"></div>' +
				'<ul class="btn">' +
					'<li id="preview_save" class="viz_button over"><span>add</span></li>' +
					'<li id="preview_cancel" class="over">Cancel</li>' +
					'<div class="brclear"></div>' +
				'</ul>' +
				'</div>' +
				'</div>',
				listeners: {
					afterrender: function() {
						//if populate metricid set, then prepopulate combo with value
						var value = (mm.viz.o_populate.metric_id) ? mm.viz.o_populate.metric_id : '';
						//render combo
						mm.viz.combo_viz_metric = new Ext.form.ComboBox({
							typeAhead: false,
							editable:false,
							applyTo:'frm_viz_metric',
							triggerAction: 'all',
							lazyRender:false,
							width:215,
							mode:'local',
							store: new Ext.data.JsonStore({
								id: 'store_metric',
								fields: [{name:'metric_id', mapping:'id'}, 'name'],
								data: mm.viz.o_store_metric
							}),
							/*store: new Ext.data.JsonStore({
								root: 'result.metrics',
								url: s_path_request + 'event=metric.list',
								id:'store_metric',
								fields: [{name:'metric_id', mapping:'id'}, 'name']
							}),*/
							value:value,
							valueField: 'metric_id',
							displayField: 'name',
							listeners: {
								select: function(o, rec, i) {
									mm.viz.filterPresets(false, rec.data.metric_id);
								}
							}
						});
						
						//save button event
						Ext.get('preview_save').on('click', 
							function(e, o) { 
								mm.viz.save();
							}
						);
						
						//cancel button event
						Ext.get('preview_cancel').on('click', 
							function(e, o) { 
								mm.viz.reset();
								mm.viz.o_win_viz.hide();
							}
						);
					}, //end after render
					
					//before show
					beforeshow: function() {
						//change button name depending on action
						if(mm.viz.s_action == 'edit') {
							Ext.getDom('preview_save').innerHTML = '<span>save</span>';
						}
						else {
							Ext.getDom('preview_save').innerHTML = '<span>add</span>';
						}
						//if first time rendering, then build ui lists
						if(!o_render.viz) {
							o_render.viz = true;
							mm.mask.show('win_viz', 'win_viz', 'Loading visualization page. Please wait...');
							//load categories + presets
							mm.data.request({
								params: {event:'preset.list'},
								fn_success: function(o) {
									console.log(o);
									mm.mask.hide('win_viz');
									//CATEGORIES
									//template to assign categories
									var s_html = '<dt class="ico_viz_button {selected} ico_viz_{type}" cid="{name}" chart="{type}"><em></em></dt>';
									var tpl = new Ext.DomHelper.createTemplate(s_html);

									//dummy categories
									var a_dt = [
										{name:'', type:'all'},
										{name:'acategory', type:'chart'},
										{name:'bcategory', type:'numbers'},
										{name:'ccategory', type:'line'}
									];

									Ext.each(a_dt, function(o_a, i) {
										var selected = (i==0) ? 'selected' : '';
										//create category dt
										var el = tpl.append('category_list', {type: o_a.type, selected: selected, name:o_a.name}, true);
										if(i==0) {
											mm.viz.o_selected_dt = el;
										}
										el.addClassOnOver('over');
										el.setVisibilityMode(Ext.Element.DISPLAY);
										//assign events to dt list
										el.on('click', 
											function(ex, ox) {
												//if selected and it's not what's was just clicked...
												if(mm.viz.o_selected_dt.dom != Ext.get(ox).parent().dom) {
													//mm.viz.filterPresets();
													Ext.get(this).addClass('selected');
													if(mm.viz.o_selected_dt != "") {
														Ext.get(mm.viz.o_selected_dt).removeClass('selected');
													}
													else if(!Ext.get(ox).hasClass('ico_viz_all')) {
														Ext.get(Ext.DomQuery.selectNode('dt.ico_viz_all.selected', 'cnt_choose')).removeClass('selected');
													}
													mm.viz.o_selected_dt = this;
													var s_chart = this.getAttribute('chart');
													
													//filter presets
													mm.viz.filterPresets(el.dom.getAttribute('cid'));
												}
											}
										);
									});
									
									
									//PRESETS
									//template to assign presets
									var s_html = '<li id="{id}" chart="{pre_type}" class="{l_categories}" notes="{notes}" img="{img}" pre_comp="{pre_comp}" pre_term="{pre_term}">' +
													'<i class="ico_viz ico_viz_bar"></i>' +
													'<p><span>{pre_name}</span><br/><em>{pre_subtitle}</em></p>' +
													'<div class="brclear"></div>' +
												'</li>';
									var tpl = new Ext.DomHelper.createTemplate(s_html);
									//console.log(o.presets);
									Ext.each(o.presets,function(o_a,i) {
										//create each list
										var el = tpl.append('preset_list', 
											{	id: o_a.id,
												pre_name: o_a.name, 
												pre_subtitle: o_a.subtitle, 
												pre_type: o_a.type,
												pre_term: o_a.term,
												pre_comp: o_a.computation,
												notes: o_a.notes,
												img: o_a.img
											}, 
											true
										);
										mm.viz.a_li.push(el.dom);
										mm.viz.o_preset2metric[o_a.id] = o_a.metrics;
										mm.viz.o_preset2category[o_a.id] = o_a.category;
										el.addClassOnOver('over');
										el.setVisibilityMode(Ext.Element.DISPLAY);
										
										//if editing, then select preset id
										if(mm.viz.o_populate.preset_id && mm.viz.o_populate.preset_id==o_a.id) {
											mm.viz.selectList(el.dom);
										}
											
										//assign events to list
										el.on({
											'click': {
												fn: function(ex, ox) {
													mm.viz.selectList(this);
												}
											}						
										});
									}, this);
								}
							});
						}
					}//end beforeshow
				}//end listeners
			});
		},//end init
		
		//check metric
		checkShow: function(id_metric, id_category, el_id) {
			var b_show = false;
			//filter by metric
			if(id_metric == "") {
				b_show = true;
			}
			else if(mm.viz.o_preset2metric[el_id].indexOf(id_metric)!=-1) {
				b_show = true;
			}
			else {
				b_show = false;
			}
			
			//filter by category
			if(b_show == true) {
				if(id_category == "") {
					b_show = true;
				}
				else if(mm.viz.o_preset2category[el_id].indexOf(id_category) != -1) {
					b_show = true;
				}
				else {
					b_show = false;
				}
			}
			
			return b_show;
		},//end checkmetric
		
		//filter presets
		filterPresets: function(id_category, id_metric) {
			//get metric
			if(!id_metric) { id_metric = mm.viz.combo_viz_metric.getValue(); }
			//get category selected
			if(!id_category) { id_category = mm.viz.o_selected_dt.dom.getAttribute('cid'); }
			//check list to show
			Ext.each(mm.viz.a_li,function(oy,i) {
				if(mm.viz.checkShow(id_metric, id_category, oy.id)) {
					console.log(oy);
					Ext.get(oy).removeClass('hidden');
				}
				else {
					Ext.get(oy).addClass('hidden');
				}
			}, this);
			
		},//end filterPresets
		
		//populate viz with user values
		populate: function(o) {
			mm.viz.s_action = 'edit';
			//if viz window has already been rendered
			if(o_render.viz) {
				//set metric
				mm.viz.combo_viz_metric.setValue(o.metric_id);
				//set preset
				mm.viz.selectList(Ext.getDom(o.preset_id));
			}
			else {
				mm.viz.o_populate = o;
			}
		},//end populate
		
		//reset window + form
		reset: function() {
			//reset population
			mm.viz.o_populate = {};
			//unhide all hidden lists
			Ext.each(mm.viz.a_li,function(o,i){
				Ext.get(o).removeClass('hidden');
			}, this);
			//remove selected
			if(mm.viz.o_selected_li != "") {
				Ext.get(mm.viz.o_selected_li).removeClass('selected');
			}
			mm.viz.o_selected_li = "";
			if(mm.viz.o_selected_dt != "") {
				Ext.get(mm.viz.o_selected_dt).removeClass('selected');
			}	
			//select 'all' category
			var elo = Ext.get(Ext.DomQuery.selectNode('dt.ico_viz_all', 'cnt_choose'));
			elo.addClass('selected');
			mm.viz.o_selected_dt = elo;
			//reset combobox input
			mm.viz.combo_viz_metric.setValue('');
			//reset action
			mm.viz.s_action = 'add';
		},//end reset
		
		//save
		save: function() {
			var o = {
				pageid: s_curr_page,
				presetid: mm.viz.o_selected_li.id,	
				metricid: mm.viz.combo_viz_metric.getValue(),
				event: 'canvas.addgrouping'
			};
			//make sure metric and preset id are selected before submitting
			if(Ext.isEmpty(o.metricid)) {
				Ext.Msg.alert("Note", "You must select a metric before you can add");
			}
			else if(Ext.isEmpty(o.presetid)) {
				Ext.Msg.alert("Note", "You must select a preset before you can add");
			}
			else {
				//mm.mask.show('canvas', 'card_page', 'Adding content, please wait...');
				mm.mask.show('all', Ext.getBody(), 'loading content. Please wait...');
				mm.canvas.addGrouping(o);
				mm.viz.reset();
				mm.viz.o_win_viz.hide();
			}
		},//end save
		
		//select preset list
		selectList: function(el) {
			Ext.get(el).addClass('selected');
			if(mm.viz.o_selected_li != "" && mm.viz.o_selected_li != el) {
				Ext.get(mm.viz.o_selected_li).removeClass('selected');
			}
			mm.viz.o_selected_li = el;
			//preview
			Ext.getDom('preview_viz_img').setAttribute('src', el.getAttribute('img'));
			Ext.getDom('preview_legend_txt').innerHTML = el.getAttribute('notes');
			Ext.get('preview_viz').removeClass('hidden');
			Ext.get('preview_legend').removeClass('hidden');
			Ext.getDom('p_type').innerHTML = el.getAttribute('chart');
			Ext.getDom('p_comp').innerHTML = el.getAttribute('pre_comp');
			Ext.getDom('p_term').innerHTML = el.getAttribute('pre_term');
			
		}//end selectList
		
	};//end return
}();//end viz