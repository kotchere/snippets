<?php

function phptemplate_preprocess_forum_list(&$variables) {
  global $user;
  $row = 0;
  // Sanitize each forum so that the template can safely print the data.
  foreach ($variables['forums'] as $id => $forum) {
    $variables['forums'][$id]->description = !empty($forum->description) ? filter_xss_admin($forum->description) : '';
    $variables['forums'][$id]->link = url("forum/$forum->tid");
    $variables['forums'][$id]->name = check_plain($forum->name);
    $variables['forums'][$id]->is_container = !empty($forum->container);
    $variables['forums'][$id]->zebra = $row % 2 == 0 ? 'odd' : 'even';
    $row++;

    $variables['forums'][$id]->new_text = '';
    $variables['forums'][$id]->new_url = '';
    $variables['forums'][$id]->new_topics = 0;
    $variables['forums'][$id]->old_topics = $forum->num_topics;
    if ($user->uid) {
      $variables['forums'][$id]->new_topics = _forum_topics_unread($forum->tid, $user->uid);
      if ($variables['forums'][$id]->new_topics) {
        $variables['forums'][$id]->new_text = format_plural($variables['forums'][$id]->new_topics, '1 new', '@count new');
        $variables['forums'][$id]->new_url = url("forum/$forum->tid", array('fragment' => 'new'));
      }
      $variables['forums'][$id]->old_topics = $forum->num_topics - $variables['forums'][$id]->new_topics;
    }
    $variables['forums'][$id]->last_reply = theme('forum_submitted', $forum->last_post);
  }
  // Give meaning to $tid for themers. $tid actually stands for term id.
  $variables['forum_id'] = $variables['tid'];
  unset($variables['tid']);
}

function phptemplate_breadcrumb($breadcrumb) {
 	if($breadcrumb) {
		return '<div class="breadcrumb">'. implode('<em>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</em>', $breadcrumb) .'</div>';
	}
}

/**
 * theme function to provide a more link
 * @param $vid - vocab id for which more link is wanted
 * @ingroup themable
 */
function phptemplate_tagadelic_more($vid) {
  return "<div class='more-link'>". l(t('more tags »'), "tagadelic/chunk/$vid") ."</div>";
}

// expose region variables to node template files
function phptemplate_preprocess_node(&$vars, $hook) {
	$vars['search_mini'] = theme('blocks', 'search_mini');
	$vars['form_notes'] = theme('blocks', 'form_notes');
}

function reorder_links($links, $first_keys = array(), $last_keys = array()) {
    $first_links = array();
    foreach ($first_keys as $key) {
        if (isset($links[$key])) {
            $first_links[$key] = $links[$key];
            unset($links[$key]);
        }
    }
    $links = array_merge($first_links, $links);

    $last_links = array();
    foreach ($last_keys as $key) {
        if (isset($links[$key])) {
            $last_links[$key] = $links[$key];
            unset($links[$key]);
        }
    }
    $links = array_merge($links, $last_links);
   
    return $links;
}

/**
* Override theme_links() so we can reorder the $links array.
*/
function phptemplate_links($links, $attributes = array('class' => 'links')) {
    // Reorder the links however you need them.
    $links = reorder_links($links, array('comment_reply','comment_edit','comment_delete'), array());
   
    // Use the built-in theme_links() function to format the $links array.
    return theme_links($links, $attributes);
}


// Edit Form End

/*
$module = 'views';
$delta = 'el_correu';
$block = (object) module_invoke($module, 'block', 'view', $delta);
$block->module = $module;
$block->delta = $delta;
echo theme('block', $block);

function phptemplate_links($links, $attributes = array('class' => 'links')) {
        $links['comment_reply']['title'] = '+';
		$links['comment_edit']['title'] = '...';
		$links['comment_delete']['title'] = 'x';
		$links['comment_reply']['attributes']['title'] = 'Reply';
		$links['comment_edit']['attributes']['title'] = 'Edit';
		$links['comment_delete']['attributes']['title'] = 'Delete';

   return theme_links($links, $attributes);
}*/

?>