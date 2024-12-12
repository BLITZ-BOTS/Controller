use reqwest::blocking::get;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use serde_yaml;
use std::fs::{self, File};
use std::io::{Read, Write};
use std::path::Path;
use zip::read::ZipArchive;

#[derive(Serialize, Deserialize, Clone)]
pub struct BotFile {
    pub name: String,
    pub path: String,
    pub index: i32,
}

#[tauri::command]
fn create_bot(token: String, path: String) -> Result<(), String> {
    let bot_path = Path::new(&path);

    // Step 1: Create the bot directory
    if bot_path.exists() {
        return Err(format!("Directory already exists at path: {}", path));
    }

    fs::create_dir_all(bot_path).map_err(|e| format!("Failed to create directory: {}", e))?;

    // Step 2: Create the "bot.ts" file
    let bot_ts_url = "https://raw.githubusercontent.com/BLITZ-BOTS/Bot/main/Examples/custom_intents.ts";
    let bot_ts_content = get(bot_ts_url)
        .map_err(|e| format!("Failed to fetch bot.ts template: {}", e))?
        .text()
        .map_err(|e| format!("Failed to read response text: {}", e))?;

    let bot_ts_path = bot_path.join("bot.ts");
    let mut bot_ts_file =
        File::create(&bot_ts_path).map_err(|e| format!("Failed to create bot.ts: {}", e))?;
    bot_ts_file
        .write_all(bot_ts_content.as_bytes())
        .map_err(|e| format!("Failed to write to bot.ts: {}", e))?;

    // Step 3: Create the "deno.json" file
    let deno_json_content = r#"
{
  "tasks": {
    "start": "deno run --allow-net --allow-read --allow-env --env=.env bot.ts"
  }
}
"#;

    let deno_json_path = bot_path.join("deno.json");
    let mut deno_json_file =
        File::create(&deno_json_path).map_err(|e| format!("Failed to create deno.json: {}", e))?;
    deno_json_file
        .write_all(deno_json_content.as_bytes())
        .map_err(|e| format!("Failed to write to deno.json: {}", e))?;

    // Step 4: Create the ".env" file
    let env_content = format!("DISCORD_TOKEN=\"{}\"", token);
    let env_path = bot_path.join(".env");
    let mut env_file =
        File::create(&env_path).map_err(|e| format!("Failed to create .env file: {}", e))?;
    env_file
        .write_all(env_content.as_bytes())
        .map_err(|e| format!("Failed to write to .env file: {}", e))?;

    // Step 5: Create the "plugins" directory
    let plugins_path = bot_path.join("plugins");
    fs::create_dir_all(plugins_path)
        .map_err(|e| format!("Failed to create plugins directory: {}", e))?;

    Ok(())
}

#[tauri::command]
fn fetch_bots(path: String) -> Result<Vec<BotFile>, String> {
    let path = Path::new(&path);
    let mut bots = Vec::new();

    if path.is_dir() {
        for (index, entry) in std::fs::read_dir(path)
            .map_err(|e| e.to_string())?
            .enumerate()
        {
            let entry = entry.map_err(|e| e.to_string())?;
            if entry.file_type().map_err(|e| e.to_string())?.is_dir() {
                bots.push(BotFile {
                    name: entry.file_name().into_string().unwrap_or_default(),
                    path: entry.path().to_string_lossy().into_owned(),
                    index: index as i32,
                });
            }
        }
    }

    Ok(bots)
}

#[tauri::command]
fn delete_dir(path: String) -> Result<(), String> {
    let path = Path::new(&path);
    if path.is_dir() {
        fs::remove_dir_all(&path).map_err(|e| format!("Failed to delete directory: {}", e))?;
        println!(
            "Directory at {} has been successfully deleted.",
            path.display()
        );
        Ok(())
    } else {
        Err(format!("Path {} is not a directory", path.display()))
    }
}

#[tauri::command]
fn get_bot_data(path: String) -> Result<serde_json::Value, String> {
    let env_path = Path::new(&path).join(".env");
    if let Err(e) = dotenv::from_path(&env_path) {
        return Err(format!(
            "Failed to load .env file from {}: {}",
            env_path.display(),
            e
        ));
    }

    let plugin_path = Path::new(&path).join("plugins");

    if plugin_path.is_dir() {
        let mut plugins = Vec::new();

        for entry in std::fs::read_dir(plugin_path)
            .map_err(|e| format!("Failed to read plugin directory: {}", e))?
        {
            let entry = entry.map_err(|e| e.to_string())?;
            if entry.file_type().map_err(|e| e.to_string())?.is_dir() {
                plugins.push(entry.path().to_string_lossy().into_owned());
            }
        }

        let env_value =
            std::env::var("DISCORD_TOKEN").unwrap_or_else(|_| "default_value".to_string());

        Ok(serde_json::json!( {
            "plugins": plugins,
            "token": env_value
        }))
    } else {
        Err(format!(
            "Plugin folder not found at path: {}",
            plugin_path.display()
        ))
    }
}

#[tauri::command]
fn install_plugin(path: String, plugin_name: String) -> Result<(), String> {
    // Step 1: Construct the URL for the plugin metadata
    let url = format!("https://api.blitz-bots.com/plugins/get/{}", plugin_name);

    // Step 2: Fetch plugin data from the API
    let text_response = get(url)
        .map_err(|e| format!("Failed to fetch plugin data: {}", e))?
        .text()
        .map_err(|e| format!("Failed to read response text: {}", e))?;

    // Step 3: Deserialize the response text into a JSON Value
    let response: Value = serde_json::from_str(&text_response)
        .map_err(|e| format!("Failed to deserialize plugin data: {}", e))?;

    if let Some(repo_url) = response.get("data").and_then(|d| d.get("repoUrl")) {
        let mut repo_url = repo_url.as_str().unwrap_or("").to_string();

        // If the URL points to a GitHub tree URL (e.g., https://github.com/user/repo/tree/branch), convert it to a Git clone URL
        if repo_url.contains("/tree/") {
            // Replace "/tree/" with "/archive/" and append ".zip"
            repo_url = repo_url.replace("/tree/", "/archive/") + ".zip"; // Ensure the left side is a String
        }

        // Step 4: Download the ZIP file from the repository URL
        let temp_zip_path = Path::new(&path).join(format!("{}.zip", plugin_name));
        let mut response =
            get(&repo_url).map_err(|e| format!("Failed to download the zip file: {}", e))?;

        let mut temp_zip_file = File::create(&temp_zip_path)
            .map_err(|e| format!("Failed to create ZIP file: {}", e))?;
        response
            .copy_to(&mut temp_zip_file)
            .map_err(|e| format!("Failed to write ZIP file to disk: {}", e))?;

        // Step 5: Extract the ZIP file
        let zip_file =
            File::open(&temp_zip_path).map_err(|e| format!("Failed to open ZIP file: {}", e))?;
        let mut archive =
            ZipArchive::new(zip_file).map_err(|e| format!("Failed to read the ZIP file: {}", e))?;

        // Step 6: Identify the top-level folder in the ZIP and extract the files correctly
        let mut top_level_folder: Option<String> = None;
        for i in 0..archive.len() {
            let file = archive
                .by_index(i)
                .map_err(|e| format!("Failed to read file from ZIP: {}", e))?;

            // Identify the top-level folder (if any)
            if let Some(first_dir) = file.name().split('/').next() {
                if top_level_folder.is_none() {
                    top_level_folder = Some(first_dir.to_string());
                }
            }
        }

        // Step 7: Prepare the target plugin folder inside /plugins
        let plugin_dir = Path::new(&path).join("plugins").join(&plugin_name);
        if !plugin_dir.exists() {
            fs::create_dir_all(&plugin_dir)
                .map_err(|e| format!("Failed to create plugin directory: {}", e))?;
        }

        // Step 8: Now that we know the top-level folder (if any), extract the files
        let mut extracted_files = false;
        for i in 0..archive.len() {
            let mut file = archive
                .by_index(i)
                .map_err(|e| format!("Failed to read file from ZIP: {}", e))?;

            // If there is a top-level folder, strip it off and extract
            let outpath = if let Some(top_level) = &top_level_folder {
                // Remove the top-level folder part and keep the relative path
                let file_name = file.name().replace(&format!("{}/", top_level), "");
                plugin_dir.join(file_name)
            } else {
                plugin_dir.join(file.name())
            };

            if file.name().ends_with('/') {
                // Create directories for folders in the ZIP
                fs::create_dir_all(&outpath).map_err(|e| {
                    format!("Failed to create directory {}: {}", outpath.display(), e)
                })?;
            } else {
                // Extract the file and write it to disk
                let mut out_file = File::create(&outpath)
                    .map_err(|e| format!("Failed to create file {}: {}", outpath.display(), e))?;
                std::io::copy(&mut file, &mut out_file)
                    .map_err(|e| format!("Failed to copy file content: {}", e))?;
            }
            extracted_files = true;
        }

        if !extracted_files {
            return Err("No files found in the ZIP archive.".into());
        }

        // Step 9: Delete the ZIP file after extraction
        fs::remove_file(&temp_zip_path)
            .map_err(|e| format!("Failed to delete the ZIP file: {}", e))?;

        println!(
            "Plugin {} installed successfully in {}",
            plugin_name,
            plugin_dir.display()
        );
        Ok(())
    } else {
        Err("Repository URL not found for the plugin".into())
    }
}

#[tauri::command]
fn get_plugin_config(path: String) -> Result<Value, String> {
    let path = Path::new(&path);

    // Check if the file exists
    if !path.exists() {
        return Err(format!("File not found at path: {}", path.display()));
    }

    // Open the YAML file
    let mut file = File::open(path).map_err(|e| format!("Failed to open file: {}", e))?;

    // Read the file content into a string
    let mut contents = String::new();
    file.read_to_string(&mut contents)
        .map_err(|e| format!("Failed to read file content: {}", e))?;

    // Parse the YAML content
    let yaml_value: serde_yaml::Value = serde_yaml::from_str(&contents)
        .map_err(|e| format!("Failed to parse YAML content: {}", e))?;

    // Convert the YAML to JSON
    let json_value = serde_json::to_value(yaml_value)
        .map_err(|e| format!("Failed to convert YAML to JSON: {}", e))?;

    Ok(json_value)
}

#[tauri::command]
fn remove_config_value(path: String, parent: String, item: String) -> Result<(), String> {
    let path = Path::new(&path);

    // Check if the file exists
    if !path.exists() {
        return Err(format!("File not found at path: {}", path.display()));
    }

    // Open the YAML file
    let mut file = File::open(&path).map_err(|e| format!("Failed to open file: {}", e))?;

    // Read the file content into a string
    let mut contents = String::new();
    file.read_to_string(&mut contents)
        .map_err(|e| format!("Failed to read file content: {}", e))?;

    // Parse the YAML content
    let mut yaml_value: serde_yaml::Value = serde_yaml::from_str(&contents)
        .map_err(|e| format!("Failed to parse YAML content: {}", e))?;

    // Navigate to the "config" section
    if let Some(config) = yaml_value.get_mut("config") {
        if let Some(parent_value) = config.get_mut(&parent) {
            if let Some(array) = parent_value.as_sequence_mut() {
                // Remove the item from the list
                let original_length = array.len();
                array.retain(|v| v != &serde_yaml::Value::String(item.clone()));

                // Check if the item was removed
                if array.len() == original_length {
                    return Err(format!("Item '{}' not found under '{}'", item, parent));
                }
            } else {
                return Err(format!("Parent '{}' is not a list", parent));
            }
        } else {
            return Err(format!("Parent '{}' not found in config", parent));
        }
    } else {
        return Err("Config section not found in the YAML file".into());
    }

    // Write the updated YAML back to the file
    let updated_yaml = serde_yaml::to_string(&yaml_value)
        .map_err(|e| format!("Failed to serialize updated YAML: {}", e))?;
    let mut file =
        File::create(&path).map_err(|e| format!("Failed to open file for writing: {}", e))?;
    file.write_all(updated_yaml.as_bytes())
        .map_err(|e| format!("Failed to write updated YAML content: {}", e))?;

    println!("Successfully removed '{}' from '{}'", item, parent);
    Ok(())
}

#[tauri::command]
fn add_config_value(path: String, parent: String, item: String) -> Result<(), String> {
    let path = Path::new(&path);

    // Check if the file exists
    if !path.exists() {
        return Err(format!("File not found at path: {}", path.display()));
    }

    // Open the YAML file
    let mut file = File::open(&path).map_err(|e| format!("Failed to open file: {}", e))?;

    // Read the file content into a string
    let mut contents = String::new();
    file.read_to_string(&mut contents)
        .map_err(|e| format!("Failed to read file content: {}", e))?;

    // Parse the YAML content
    let mut yaml_value: serde_yaml::Value = serde_yaml::from_str(&contents)
        .map_err(|e| format!("Failed to parse YAML content: {}", e))?;

    // Navigate to the "config" section
    if let Some(config) = yaml_value.get_mut("config") {
        if let Some(parent_value) = config.get_mut(&parent) {
            if let Some(array) = parent_value.as_sequence_mut() {
                // Add the new item to the list
                array.push(serde_yaml::Value::String(item.clone())); // Clone `item` here to avoid moving it

                // Check if the item was added
                if let Some(last_item) = array.last() {
                    if let serde_yaml::Value::String(ref s) = last_item {
                        println!("Successfully added '{}' to '{}'", s, parent);
                    }
                }
            } else {
                return Err(format!("Parent '{}' is not a list", parent));
            }
        } else {
            return Err(format!("Parent '{}' not found in config", parent));
        }
    } else {
        return Err("Config section not found in the YAML file".into());
    }

    // Write the updated YAML back to the file
    let updated_yaml = serde_yaml::to_string(&yaml_value)
        .map_err(|e| format!("Failed to serialize updated YAML: {}", e))?;
    let mut file =
        File::create(&path).map_err(|e| format!("Failed to open file for writing: {}", e))?;
    file.write_all(updated_yaml.as_bytes())
        .map_err(|e| format!("Failed to write updated YAML content: {}", e))?;

    Ok(())
}

#[tauri::command]
fn set_config_value(path: String, key: String, value: String) -> Result<(), String> {
    let path = Path::new(&path);

    // Check if the file exists
    if !path.exists() {
        return Err(format!("File not found at path: {}", path.display()));
    }

    // Open the YAML file
    let mut file = File::open(&path).map_err(|e| format!("Failed to open file: {}", e))?;

    // Read the file content into a string
    let mut contents = String::new();
    file.read_to_string(&mut contents)
        .map_err(|e| format!("Failed to read file content: {}", e))?;

    // Parse the YAML content
    let mut yaml_value: serde_yaml::Value = serde_yaml::from_str(&contents)
        .map_err(|e| format!("Failed to parse YAML content: {}", e))?;

    // Navigate directly to the "config" section
    if let Some(config) = yaml_value.get_mut("config") {
        // Ensure the config is a mapping (dictionary)
        if let Some(map) = config.as_mapping_mut() {
            // Set the key-value pair
            map.insert(
                serde_yaml::Value::String(key.clone()),
                serde_yaml::Value::String(value.clone()),
            );

            // Check if the key-value pair was added
            if let Some(serde_yaml::Value::String(ref s)) =
                map.get(&serde_yaml::Value::String(key.clone()))
            {
                println!("Successfully set '{}' to '{}'", key, s);
            }
        } else {
            return Err("Config section is not a map".into());
        }
    } else {
        return Err("Config section not found in the YAML file".into());
    }

    // Write the updated YAML back to the file
    let updated_yaml = serde_yaml::to_string(&yaml_value)
        .map_err(|e| format!("Failed to serialize updated YAML: {}", e))?;
    let mut file =
        File::create(&path).map_err(|e| format!("Failed to open file for writing: {}", e))?;
    file.write_all(updated_yaml.as_bytes())
        .map_err(|e| format!("Failed to write updated YAML content: {}", e))?;

    println!("Successfully set '{}' to '{}' in config", key, value);
    Ok(())
}






#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            create_bot,
            fetch_bots,
            delete_dir,
            get_bot_data,
            install_plugin,
            get_plugin_config,
            remove_config_value,
            add_config_value,
            set_config_value
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
