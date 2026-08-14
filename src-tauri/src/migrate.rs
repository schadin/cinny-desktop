use std::fs;
use std::path::{Path, PathBuf};

const OLD_IDENTIFIER: &str = "in.cinny.app";
const NEW_IDENTIFIER: &str = "io.github.schadin.harrier";
const MARKER_FILE: &str = "migration.success";

fn home_dir() -> Option<PathBuf> {
    std::env::var_os("HOME")
        .or_else(|| std::env::var_os("USERPROFILE"))
        .map(PathBuf::from)
}

#[cfg(target_os = "linux")]
fn base_config_dir() -> Option<PathBuf> {
    std::env::var_os("XDG_CONFIG_HOME")
        .map(PathBuf::from)
        .filter(|p| p.is_absolute())
        .or_else(|| home_dir().map(|h| h.join(".config")))
}

#[cfg(target_os = "linux")]
fn base_data_dir() -> Option<PathBuf> {
    std::env::var_os("XDG_DATA_HOME")
        .map(PathBuf::from)
        .filter(|p| p.is_absolute())
        .or_else(|| home_dir().map(|h| h.join(".local").join("share")))
}

#[cfg(any(target_os = "macos", target_os = "windows"))]
fn base_config_dir() -> Option<PathBuf> {
    #[cfg(target_os = "macos")]
    {
        home_dir().map(|h| h.join("Library").join("Application Support"))
    }
    #[cfg(target_os = "windows")]
    {
        std::env::var_os("APPDATA").map(PathBuf::from)
    }
}

#[cfg(any(target_os = "macos", target_os = "windows"))]
fn base_data_dir() -> Option<PathBuf> {
    base_config_dir()
}

fn copy_dir_no_overwrite(src: &Path, dst: &Path) -> std::io::Result<()> {
    if !src.is_dir() {
        return Ok(());
    }
    fs::create_dir_all(dst)?;
    for entry in fs::read_dir(src)? {
        let entry = entry?;
        let file_type = entry.file_type()?;
        let src_path = entry.path();
        let dst_path = dst.join(entry.file_name());
        if file_type.is_dir() {
            copy_dir_no_overwrite(&src_path, &dst_path)?;
        } else if file_type.is_file() && !dst_path.exists() {
            if let Err(e) = fs::copy(&src_path, &dst_path) {
                eprintln!("migrate: failed to copy {}: {}", src_path.display(), e);
            }
        }
    }
    Ok(())
}

fn dir_is_empty(path: &Path) -> bool {
    fs::read_dir(path)
        .map(|mut entries| entries.next().is_none())
        .unwrap_or(true)
}

fn create_marker(new_config_dir: &Path) {
    if let Err(e) = fs::write(new_config_dir.join(MARKER_FILE), "") {
        eprintln!("migrate: failed to create marker: {}", e);
    }
}

pub fn migrate_settings() {
    let (Some(old_config), Some(new_config)) = (
        base_config_dir().map(|d| d.join(OLD_IDENTIFIER)),
        base_config_dir().map(|d| d.join(NEW_IDENTIFIER)),
    ) else {
        return;
    };
    let old_data = base_data_dir().map(|d| d.join(OLD_IDENTIFIER));
    let new_data = base_data_dir().map(|d| d.join(NEW_IDENTIFIER));

    if new_config.join(MARKER_FILE).exists() {
        return;
    }

    let old_exists = old_config.exists()
        || old_data
            .as_ref()
            .map(|d| d.exists())
            .unwrap_or(false);

    if !old_exists {
        if let Err(e) = fs::create_dir_all(&new_config) {
            eprintln!("migrate: failed to create config dir: {}", e);
            return;
        }
        create_marker(&new_config);
        return;
    }

    if (new_config.exists() && !dir_is_empty(&new_config))
        || new_data
            .as_ref()
            .map(|d| d.exists() && !dir_is_empty(d))
            .unwrap_or(false)
    {
        create_marker(&new_config);
        return;
    }

    if let Err(e) = fs::create_dir_all(&new_config) {
        eprintln!("migrate: failed to create config dir: {}", e);
        return;
    }

    if let Err(e) = copy_dir_no_overwrite(&old_config, &new_config) {
        eprintln!("migrate: config copy failed: {}", e);
    }
    if let (Some(old_data), Some(new_data)) = (&old_data, &new_data) {
        if *old_data != old_config && *new_data != new_config {
            if let Err(e) = copy_dir_no_overwrite(old_data, new_data) {
                eprintln!("migrate: data copy failed: {}", e);
            }
        }
    }

    create_marker(&new_config);
}
