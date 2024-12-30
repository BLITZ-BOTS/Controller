use tauri_plugin_deep_link::DeepLinkExt;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  let mut builder = tauri::Builder::default();
        
  #[cfg(desktop)]
  {
      builder = builder.plugin(tauri_plugin_single_instance::init(|_app, argv, _cwd| {
        println!("a new app instance was opened with {argv:?} and the deep link event was already triggered");
        // when defining deep link schemes at runtime, you must also check `argv` here
      }));
  }
        builder = builder.plugin(tauri_plugin_deep_link::init()).setup(|app| {
          #[cfg(desktop)]
          app.deep_link().register("blitz-controller")?;
          Ok(())
      });
       builder = builder.plugin(tauri_plugin_updater::Builder::new().build());
       builder = builder.plugin(tauri_plugin_shell::init());
       builder = builder.plugin(tauri_plugin_fs::init());
       builder = builder.plugin(tauri_plugin_opener::init());
       builder.run(tauri::generate_context!());
}
