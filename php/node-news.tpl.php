<?php if($page) { ?>
	<div class="node <?php print $node->type; ?>">
		<div class="mini_header">
			<div class="fleft"><?php print date('F j, Y', strtotime($node->field_display_date[0]['value'])); ?></div>
			<div class="fright">
				<a href="#comments_top"><?php print $node->comment_count; ?> Comment<?php if($node->comment_count != 1) print 's'; ?></a> 
				&nbsp;|&nbsp; <?php print $node->content['addtoany']['#value']; ?>
				&nbsp;|&nbsp;&nbsp; <a href="javascript:window.print();"><div class="ico_print fright" title="Print"></div></a><div class="brclear"></div>
			</div>
			<div class="brclear"></div>
		</div>
		<div class="content">
				<?php if(isset($node->field_pic[0]['view']) && !empty($node->field_pic[0]['view'])): ?>x
					<div class="pic_main">
						<?php print $node->field_pic[0]['view']; ?>
						<br><span class="txt_misc"><?php print $node->field_pic_source[0]['value']; ?></span>
					</div>
				<?php endif; ?>
			<?php print $node->content['body']['#value']?>
		</div>
		<?php if(count($node->taxonomy)): ?>
			<div class="taxonomy"><strong>Tags:	</strong>
			<?php foreach($node->taxonomy as $s_key => $o_value): ?>
				<?php $s_comma = ($b_tax) ? ', ' : ''; ?>
				<?php print $s_comma.l($o_value->name, drupal_get_path_alias(taxonomy_term_path().$o_value->tid)) ?>
				<?php $b_tax=true; ?>
			<?php endforeach; ?>
		</div>
		<?php endif; ?>
		<br><br>
		<?php if ($links) { ?><div class="links"><?php print $links?></div><?php }; ?>
		
	</div>
<?php //this is when it's not a page (hopefully a taxonomy) ?>
<?php } else { ?>
	<h3><a href="?q=<?php print $node->path; ?>"><?php print $node->title; ?></a></h3>
	<div class="tax <?php print $node->type; ?>">
		<div class="mini_header">
			<div class="fleft">
				Type: News<br>
				Source: <?php print $node->field_url_title[0]['value']; ?>
			</div>
			<div class="fright"><?php print date('F j, Y', strtotime($node->field_display_date[0]['value'])); ?></div>
			<div class="brclear"></div>
		</div>
		<div class="content"><?php  print $node->content['body']['#value'] ?></div>
		<?php if ($links) { ?><div class="links"><?php print $links?></div><?php }; ?>
	</div>
<?php } ?>