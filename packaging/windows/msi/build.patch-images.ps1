$ErrorActionPreference = "Stop"
Set-PSDebug -Trace 1

function PatchImages($Product, $Version, $Description) {
  Write-Host "PatchImages called with product $Product, version $Version and description $Description"
  $Repo = "seal-icons"
  $TargetResourceDir = "packaging/windows/msi/resource/images"
  # check for product or service
  Write-Host -NoNewline "Patching images for "
  if ("$Description" -ne "") {
    Write-Host -NoNewline "product "
  } else {
    Write-Host -NoNewline "service "
    # for services use platform icons
    $Product = "SEAL"
  }
  switch ($Product) {
    {($_ -eq "plossys") -Or ($_ -eq "out-ngn")} {
      $name = "PLOSSYS_Output_Engine"
      Break
    }
    "build-pipeline-playground" {
      $name = "SEAL"
      Break
    }
    default {
      $name = "Default"
    }
  }
  Write-Host "$Product from $Repo/$name"
  # if ($Version -ne "") {
  #   $branch = "--branch $Version"
  #   Write-Host "Using branch info: Version = $Version"
  # }
  Write-Host "...ignoring version $Version..."

  # Clone images from github
  git clone $branch https://${env:GITHUB_TOKEN}@github.com/sealsystems/$Repo
  $Dir = "seal-icons/$name"
  if (-Not (Test-Path -Path $Dir)) {
    Write-Host "Image directory $Dir not found!"
    return 13
  }
  Write-Host Listing of $Dir
  ls $Dir

  # Copy to target images
  Write-Host Listing of current $TargetResourceDir
  ls $TargetResourceDir

  # copy Icon
  $File = (Get-ChildItem -Path "$Dir" *.ico).Name
  $Path = "$Dir/$File"
  $Destination = "$TargetResourceDir/logo.ico"
  Copy-Item -Path "$Path" -Destination "$Destination" -Force -ErrorAction SilentlyContinue
  if (-Not $?) {
    WriteHost $Error[0].ToString()
    WriteHost "From: ""$Path"", to: ""$Destination"""
  }
  # copy logo for bundle banner
  if ("$Description" -ne "") {
    $File = (Get-ChildItem -Path "$Dir" *.png).Name
    if (-Not $?) {
      WriteHost $Error[0].ToString()
      WriteHost "No PNG file for bundle banner found. Using copy of icon file!"
      $File = (Get-ChildItem -Path "$Dir" *.ico).Name
    }
    $Path = "$Dir/$File"
    $Destination = "$TargetResourceDir/logo.png"
    Copy-Item -Path "$Path" -Destination "$Destination" -Force -ErrorAction SilentlyContinue
    if (-Not $?) {
      WriteHost $Error[0].ToString()
      WriteHost "From: ""$Path"", to: ""$Destination"""
    }
  } else {
    # copy banner
    $File = Get-ChildItem -Path "$Path" | Where-Object {$_.Name -match '.*Banner.*\.bmp'}
    $Path = "$Dir/$File"
    $Destination = "$TargetResourceDir/msi_banner.bmp"
    Copy-Item -Path "$Path" -Destination "$Destination" -Force -ErrorAction SilentlyContinue
    if (-Not $?) {
      WriteHost $Error[0].ToString()
      WriteHost "From: ""$Path"", to: ""$Destination"""
    }
    # copy dialog
    $File = Get-ChildItem -Path "$Path" | Where-Object {$_.Name -match '.*Dialog.*\.bmp'}
    $Path = "$Dir/$File"
    $Destination = "$TargetResourceDir/msi_dialog.bmp"
    Copy-Item -Path "$Path" -Destination "$Destination" -Force -ErrorAction SilentlyContinue
    if (-Not $?) {
      WriteHost $Error[0].ToString()
      WriteHost "From: ""$Path"", to: ""$Destination"""
    }
  }
  Remove-Item -Recurse -Force seal-icons
  Write-Host Listing of new $TargetResourceDir
  ls $TargetResourceDir
}

# Patch images
PatchImages "$env:PACKAGE_NAME" "$env:PACKAGE_VERSION" "$env:PRODUCT_DESCRIPTION" 
