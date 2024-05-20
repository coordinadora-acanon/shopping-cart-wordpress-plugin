<?php

/**
 * Plugin Name: Cart Widget
 * Description: Un plugin para un carrito de compras utilizando Ionic y JavaScript.
 * Version: 1.0
 * Author: Tu Nombre
 */


// Evitar el acceso directo
if (!defined('ABSPATH')) {
  exit;
}

// Registrar los scripts y estilos necesarios
function cart_widget_enqueue_scripts()
{
  wp_enqueue_script('ionic-core-module', 'https://cdn.jsdelivr.net/npm/@ionic/core/dist/ionic/ionic.esm.js', [], null, true);
  wp_enqueue_script('ionic-core-nomodule', 'https://cdn.jsdelivr.net/npm/@ionic/core/dist/ionic/ionic.js', [], null, true);
  wp_enqueue_style('ionic-core-css', 'https://cdn.jsdelivr.net/npm/@ionic/core/css/ionic.bundle.css', [], null, 'all');
  wp_enqueue_script('cart-widget-js', plugins_url('cart-widget.js', __FILE__), [], null, true);
}
add_action('wp_enqueue_scripts', 'cart_widget_enqueue_scripts');

// Generar el shortcode para el widget del carrito [cart_widget]
function cart_widget_shortcode()
{
  ob_start();
?>
  <ion-app>
    <ion-header>
      <ion-toolbar>
        <ion-title>Lista de Productos</ion-title>
        <ion-buttons slot="end">
          <ion-button id="cart-button" onclick="cartWidget.showCart()">Cart (0)</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <ion-grid>
        <ion-row id="product-grid">
        </ion-row>
      </ion-grid>
    </ion-content>
  </ion-app>
<?php
  return ob_get_clean();
}
add_shortcode('cart_widget', 'cart_widget_shortcode');

function cart_widget_load_modal_html()
{
  include plugin_dir_path(__FILE__) . 'cart-modal.html';
}
add_action('wp_footer', 'cart_widget_load_modal_html');
?>