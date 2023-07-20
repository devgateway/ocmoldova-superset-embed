<?php
    /* Place this in the functions.php of the theme, or, without chanting the theme, you can first install
    the plugin Code Snippets and place this code in it, to run on frontend only.
    This will create a new REST endpoint that will return the custom fields save in a page, by its slug.
     */

function get_custom_fields_by_slug( $data ) {
  $args = array(
    'name'        => $data['slug'],
    'post_type'   => 'page',
    'post_status' => 'publish',
    'numberposts' => 1
  );
  $my_posts = get_posts($args);
  
  if( $my_posts ) {
    $post_id = $my_posts[0]->ID;
    $post_meta = get_post_meta($post_id);
    
    // Optional: filter out protected meta (those starting with an underscore)
    $post_meta = array_filter($post_meta, function($key) {
      return !str_starts_with($key, '_');
    }, ARRAY_FILTER_USE_KEY);
    
    return $post_meta;
  }
  
  return null;
}

add_action('rest_api_init', function () {
  register_rest_route('customRest/v1', '/page-meta/(?P<slug>[a-zA-Z0-9-]+)', array(
    'methods'  => 'GET',
    'callback' => 'get_custom_fields_by_slug',
  ));
});
