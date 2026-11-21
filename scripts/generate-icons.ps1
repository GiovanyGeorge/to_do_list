Add-Type -AssemblyName System.Drawing

function Create-RoundedRectangleGraphicsPath {
    param(
        [System.Drawing.RectangleF]$rect,
        [float]$radius
    )
    $path = [System.Drawing.Drawing2D.GraphicsPath]::new()
    $diameter = $radius * 2

    # Top-Left Arc
    $path.AddArc($rect.X, $rect.Y, $diameter, $diameter, 180, 90)
    # Top-Right Arc
    $path.AddArc($rect.Right - $diameter, $rect.Y, $diameter, $diameter, 270, 90)
    # Bottom-Right Arc
    $path.AddArc($rect.Right - $diameter, $rect.Bottom - $diameter, $diameter, $diameter, 0, 90)
    # Bottom-Left Arc
    $path.AddArc($rect.X, $rect.Bottom - $diameter, $diameter, $diameter, 90, 90)
    $path.CloseFigure()

    return $path
}

function Render-LifeFlowIcon {
    param(
        [int]$size,
        [bool]$isTray = $false
    )

    $bmp = [System.Drawing.Bitmap]::new($size, $size, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.Clear([System.Drawing.Color]::Transparent)

    if (-not $isTray) {
        # App Icon: Squircle badge with Terracotta gradient & warm cream dual checkmark
        $padding = [Math]::Max(1.0, $size * 0.05)
        $badgeRect = [System.Drawing.RectangleF]::new(
            $padding,
            $padding,
            $size - ($padding * 2),
            $size - ($padding * 2)
        )
        $cornerRadius = $badgeRect.Width * 0.22

        # 1. Subtle drop shadow
        if ($size -ge 48) {
            $shadowRect = [System.Drawing.RectangleF]::new(
                $badgeRect.X,
                $badgeRect.Y + ($size * 0.03),
                $badgeRect.Width,
                $badgeRect.Height
            )
            $shadowPath = Create-RoundedRectangleGraphicsPath $shadowRect $cornerRadius
            $shadowBrush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(40, 28, 25, 23))
            $g.FillPath($shadowBrush, $shadowPath)
            $shadowBrush.Dispose()
            $shadowPath.Dispose()
        }

        # 2. Main terracotta gradient body (#EA580C -> #C2410C -> #9A3412)
        $badgePath = Create-RoundedRectangleGraphicsPath $badgeRect $cornerRadius
        $gradBrush = [System.Drawing.Drawing2D.LinearGradientBrush]::new(
            $badgeRect,
            [System.Drawing.Color]::FromArgb(255, 234, 88, 12),  # #EA580C (Vibrant warm terracotta)
            [System.Drawing.Color]::FromArgb(255, 154, 52, 18),  # #9A3412 (Deep terracotta)
            45.0
        )
        $g.FillPath($gradBrush, $badgePath)

        # 3. Inner border / highlight
        $borderPen = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(50, 255, 251, 235), [Math]::Max(1.0, $size * 0.02))
        $g.DrawPath($borderPen, $badgePath)
        $borderPen.Dispose()
        $gradBrush.Dispose()
        $badgePath.Dispose()

        # 4. Foreground: Dual Checkmark in Warm Cream (#FFFBEB / #FAF7F2)
        $checkColor = [System.Drawing.Color]::FromArgb(255, 255, 251, 235) # Warm cream
        $strokeWidth = [Math]::Max(2.0, $size * 0.09)
        $pen = [System.Drawing.Pen]::new($checkColor, $strokeWidth)
        $pen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
        $pen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
        $pen.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round

        # Checkmark 1 (Left / Back, slightly lower opacity or offset)
        # Coordinates scaled relative to size
        $c1_p1 = [System.Drawing.PointF]::new($size * 0.28, $size * 0.52)
        $c1_p2 = [System.Drawing.PointF]::new($size * 0.42, $size * 0.66)
        $c1_p3 = [System.Drawing.PointF]::new($size * 0.62, $size * 0.36)

        # Draw first check
        $pen1 = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(220, 255, 251, 235), $strokeWidth * 0.95)
        $pen1.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
        $pen1.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
        $pen1.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round
        $g.DrawLines($pen1, @($c1_p1, $c1_p2, $c1_p3))
        $pen1.Dispose()

        # Checkmark 2 (Right / Front, prominent and sweeping)
        $c2_p1 = [System.Drawing.PointF]::new($size * 0.44, $size * 0.52)
        $c2_p2 = [System.Drawing.PointF]::new($size * 0.56, $size * 0.66)
        $c2_p3 = [System.Drawing.PointF]::new($size * 0.76, $size * 0.36)

        $pen2 = [System.Drawing.Pen]::new($checkColor, $strokeWidth)
        $pen2.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
        $pen2.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
        $pen2.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round
        $g.DrawLines($pen2, @($c2_p1, $c2_p2, $c2_p3))
        $pen2.Dispose()

        $pen.Dispose()
    } else {
        # Tray Icon: Crisp transparent background with terracotta/warm-cream dual check or badge
        # In Windows tray, a clean rounded terracotta icon with white checkmarks is standard
        $padding = [Math]::Max(1.0, $size * 0.08)
        $badgeRect = [System.Drawing.RectangleF]::new(
            $padding,
            $padding,
            $size - ($padding * 2),
            $size - ($padding * 2)
        )
        $cornerRadius = $badgeRect.Width * 0.28

        $badgePath = Create-RoundedRectangleGraphicsPath $badgeRect $cornerRadius
        $brush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(255, 194, 65, 12)) # #C2410C
        $g.FillPath($brush, $badgePath)
        $brush.Dispose()
        $badgePath.Dispose()

        $strokeWidth = [Math]::Max(1.5, $size * 0.11)
        $pen = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(255, 255, 251, 235), $strokeWidth)
        $pen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
        $pen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
        $pen.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round

        $c1_p1 = [System.Drawing.PointF]::new($size * 0.26, $size * 0.52)
        $c1_p2 = [System.Drawing.PointF]::new($size * 0.40, $size * 0.66)
        $c1_p3 = [System.Drawing.PointF]::new($size * 0.60, $size * 0.36)
        $g.DrawLines($pen, @($c1_p1, $c1_p2, $c1_p3))

        $c2_p1 = [System.Drawing.PointF]::new($size * 0.44, $size * 0.52)
        $c2_p2 = [System.Drawing.PointF]::new($size * 0.56, $size * 0.66)
        $c2_p3 = [System.Drawing.PointF]::new($size * 0.74, $size * 0.36)
        $g.DrawLines($pen, @($c2_p1, $c2_p2, $c2_p3))

        $pen.Dispose()
    }

    $g.Dispose()
    return $bmp
}

function Build-IcoFile {
    param(
        [System.Drawing.Bitmap[]]$bitmaps,
        [string]$outputPath
    )

    $pngBytesList = [System.Collections.Generic.List[byte[]]]::new()
    $sizes = [System.Collections.Generic.List[int]]::new()

    foreach ($bmp in $bitmaps) {
        $ms = [System.IO.MemoryStream]::new()
        $bmp.Save($ms, [System.Drawing.Imaging.ImageFormat]::Png)
        $bytes = $ms.ToArray()
        $pngBytesList.Add($bytes)
        $sizes.Add($bmp.Width)
        $ms.Dispose()
    }

    $fileStream = [System.IO.FileStream]::new($outputPath, [System.IO.FileMode]::Create)
    $writer = [System.IO.BinaryWriter]::new($fileStream)

    $count = $pngBytesList.Count
    # 1. ICONDIR Header (6 bytes)
    $writer.Write([uint16]0)     # Reserved
    $writer.Write([uint16]1)     # Type: 1 = ICO
    $writer.Write([uint16]$count) # Number of images

    # Calculate starting offset for image data: 6 + (16 * count)
    $offset = 6 + (16 * $count)

    # 2. ICONDIRENTRY (16 bytes per image)
    for ($i = 0; $i -lt $count; $i++) {
        $s = $sizes[$i]
        $bWidth = if ($s -ge 256) { [byte]0 } else { [byte]$s }
        $bHeight = if ($s -ge 256) { [byte]0 } else { [byte]$s }
        $bytesLen = $pngBytesList[$i].Length

        $writer.Write($bWidth)              # Width (0 for 256)
        $writer.Write($bHeight)             # Height (0 for 256)
        $writer.Write([byte]0)              # Color count
        $writer.Write([byte]0)              # Reserved
        $writer.Write([uint16]1)            # Color planes
        $writer.Write([uint16]32)           # Bits per pixel
        $writer.Write([uint32]$bytesLen)    # Image size in bytes
        $writer.Write([uint32]$offset)      # File offset of image data

        $offset += $bytesLen
    }

    # 3. Image Data (PNG streams)
    for ($i = 0; $i -lt $count; $i++) {
        $writer.Write($pngBytesList[$i])
    }

    $writer.Flush()
    $writer.Close()
    $fileStream.Close()
}

# Generate resolutions: 256, 128, 64, 48, 32, 24, 16
$resolutions = @(256, 128, 64, 48, 32, 24, 16)
$bmps = [System.Collections.Generic.List[System.Drawing.Bitmap]]::new()

foreach ($r in $resolutions) {
    $bmp = Render-LifeFlowIcon -size $r -isTray $false
    $bmps.Add($bmp)
}

# Save PNGs in resources
$bmps[0].Save("resources/icon-256.png", [System.Drawing.Imaging.ImageFormat]::Png)
$bmps[0].Save("resources/icon.png", [System.Drawing.Imaging.ImageFormat]::Png)
$bmps[0].Save("public/icon.png", [System.Drawing.Imaging.ImageFormat]::Png)

# 512x512 high-res for store / web
$bmp512 = Render-LifeFlowIcon -size 512 -isTray $false
$bmp512.Save("resources/icon-512.png", [System.Drawing.Imaging.ImageFormat]::Png)
$bmp512.Dispose()

# Build multi-resolution .ico files
Build-IcoFile -bitmaps $bmps -outputPath "resources/icon.ico"
Copy-Item -Force "resources/icon.ico" "build/icon.ico"
Copy-Item -Force "resources/icon.ico" "public/favicon.ico"

foreach ($b in $bmps) { $b.Dispose() }

# Tray icons: 16, 24, 32
$tray16 = Render-LifeFlowIcon -size 16 -isTray $true
$tray16.Save("resources/tray-icon-16.png", [System.Drawing.Imaging.ImageFormat]::Png)
$tray16.Dispose()

$tray24 = Render-LifeFlowIcon -size 24 -isTray $true
$tray24.Save("resources/tray-icon-24.png", [System.Drawing.Imaging.ImageFormat]::Png)
$tray24.Dispose()

$tray32 = Render-LifeFlowIcon -size 32 -isTray $true
$tray32.Save("resources/tray-icon.png", [System.Drawing.Imaging.ImageFormat]::Png)
$tray32.Save("resources/tray-icon@2x.png", [System.Drawing.Imaging.ImageFormat]::Png)
$tray32.Dispose()

Write-Output "LifeFlow icon set generated successfully!"
