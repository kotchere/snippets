<?php
global $a_tabs;
//include('dBug.php');
//new dBug(get_defined_vars());


if($a_tabs) {
	asort($a_tabs);
	$a_arg = explode("/", $_GET['q']);
	$s_arg = (count($a_arg) > 1) ? $a_arg[1] : $rows[0]->link;
	$s_arg = strtolower($s_arg);
	$s_arg_url = $a_tabs['url'];
	unset($a_tabs['url']);
	$b_shorten = strlen(implode(array_values($a_tabs),"")) > 80 ? true : false;
}

function ellipsis($text, $max=100, $append='&hellip;') {
	if (strlen($text) <= $max) return $text;
	$out = substr($text,0,$max);
	if (strpos($text,' ') === FALSE) return $out.$append;
	return preg_replace('/\w+$/','',$out).$append;
}

function qstring($str) {
	$str_1 = explode('=',$str);
	$str_2 = explode('/',$str_1[1]);
	return $str_2[0];
}


?>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="<?php print $language->language ?>" xml:lang="<?php print $language->language ?>" dir="<?php print $language->dir ?>">

<head>
	<title><?php print $head_title ?></title>
	<?php print $head ?>
	<?php print $styles ?>
	<?php print $scripts ?>
	<link type="text/css" rel="stylesheet" media="print" href="<?php print $directory.'/print.css'; ?>" />
	<script type="text/javascript" charset="utf-8">
		var b_search_focus = false;
		$(document).ready(function() {
			//search site
			$("#edit-search-theme-form-1")[0].value = ' Search this site';
	   		$("#edit-search-theme-form-1").focus(function(e) {
				//$(e.target).children()[0].getAttribute('href');
				if(!b_search_focus) {
					b_search_focus = true;
					this.value = '';
					this.className = 'form-text off';
				}
			});
			
			//set session cookie
			$('a.qt_tab').click(function(e) {
				var qt_parent_id = $(this).parents('.quicktabs_wrapper')[0].id;
				var qt_index = this.id.split('-')[3];
				jQuery.get('<?php print $base_path; ?>/qt_cookie_set.php', {'qt_id':qt_parent_id, 'qt_index':qt_index});
			})
	 	});
	</script>
</head>
<body<?php if($is_front) print ' class="frontp"'; ?>>
	<!-- <a href="<?php print $front_page ?>" title="<?php print t('Home') ?>"><img id="wlogo" src="<?php print $logo ?>" alt="<?php print t('Home') ?>" /></a> -->
	<br><br>
	<div id="container" class="ntype_<?php echo $node->type ?> ftype_<?php print qstring($_SERVER['QUERY_STRING']);  ?>">
		<div id="header">
			<div id="banner">
				<div class="l">
					<div class="r">
						<div class="m">
							<!-- main banner -->
							<?php print $ad_leaderboard; ?>
						</div>
					</div>
				</div>
			</div>
			<div id="nav_header">
				<div class="l">
					<div class="r">
						<div class="m">
							<!-- <a href="<?php print $front_page ?>" title="<?php print t('Home') ?>"><img id="wlogo" src="<?php print $logo ?>" alt="<?php print t('Home') ?>" /></a> -->
							<?php print $header; ?>
							<?php print $search_box; ?>
						</div>
					</div>
				</div>
			</div>
		</div>
			
		<div id="wrapper">
			<div class="top"></div>
			<div id="content">
				<div id="main">
					<div id="crumbing">
						<?php print $breadcrumb; ?>
						<?php if($is_front) print '<h1 class="fleft">'.date("F j, Y").'</h1><a href="?q=feed"><div class="rss_ico front" title="RSS Feeds"></div></a>'; ?>
					</div>
					<?php if($a_tabs): ?>
						<div class="c_tabs">
							<ul class="primary">
								<?php $s_class_pos = ' first'; ?>
								<?php foreach($a_tabs as $key => $value): ?>
									<?php $s_class = (strtolower($value)==$s_arg) ? ' active'.$s_class_pos : $s_class_pos; ?>
									<li class="<?php print $s_class; ?>">
										<?php $s_value = $value; ?>
										<?php if($b_shorten) $s_value = ellipsis($value, 18); ?>
										<a href="?q=<?php print $s_arg_url.$value; ?>"><?php print $s_value; ?></a>
									</li>
								<?php $s_class_pos = ''; ?>
								<?php endforeach; ?>
							</ul>
						</div>
					<?php endif; ?>
					<div class="c_content">
						<h1><?php echo $title; ?></h1>
						<?php if($tabs && strstr($_GET['q'], 'block')) { ?><div class="tabs"><?php print $tabs ?></div><?php } ?>
						<?php 
						if($is_front) {
							print '<div class="front">'.$front.'</div>';
						} else { 
							print $content;
						} ?>
					</div>
				</div>
				<div id="sidebar" class="sidebar">
					<?php print $ad_right; ?>
				</div>
				<div class="brclear"></div>
			</div>
			<div class="bot"></div>
		</div>			
		
	</div>
	
	<div id="footer">
		<div class="content">
			<div class="columns">
				<ul class="first">
					<h4>Articles</h4>
					<p>Some descriptive text goes here</p>
					<li><a href="?q=news">News</a></li>
					<li><a href="?q=wires">Wires</a></li>
					<li><a href="?q=newsletter">Newsletter</a></li>
				</ul>
				<ul>
					<h4>Advertising</h4>
					<p>Some descriptive text goes here</p>
					<li><a href="?q=classifieds">Classifieds</a></li>
					<li><a href="?q=directory">Directory</a></li>
					<li><a href="?q=news">Submit News</a></li>
					<li><a href="?q=advertise">Advertise with us</a></li>
				</ul>
				<ul>
					<h4>Community</h4>
					<p>Some descriptive text goes here</p>
					<li><a href="?q=blogs">Blogs</a></li>
					<li><a href="?q=forums">Forums</a></li>
					<li><a href="?q=notes">Notes & Boasts</a></li>
				</ul>
				<ul class="last">
					<h4>Syndicate</h4>
					<p>Some descriptive text goes here</p>
					<li><a href="?q=linkexchange">Link Exchange</a></li>
					<li><a href="?q=feed">RSS Feeds</a></li>
				</ul>
				<div class="brclear"></div>
			</div>
			<code>© 2009 HummerSport. All Rights Reserved.</code>
		</div>
	</div>
<?php print $closure ?>	
</body>
</html>