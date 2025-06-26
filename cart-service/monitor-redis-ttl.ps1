# Simple monitoring with clear output
while ($true) {
    Clear-Host
    Write-Host "=== Redis Cart TTL & Content Monitor ===" -ForegroundColor Blue
    Write-Host "Time: $(Get-Date)" -ForegroundColor Green
    Write-Host ""
    
    $keys = docker exec redis redis-cli KEYS "cart:*"
    if ($keys) {
        $keys -split "`n" | Where-Object { $_.Trim() } | ForEach-Object {
            $key = $_.Trim()
            $ttl = docker exec redis redis-cli TTL $key
            
            $status = switch ([int]$ttl) {
                -2 { "EXPIRED/DELETED"; break }
                -1 { "NO EXPIRY"; break }
                { $_ -le 5 } { "EXPIRING SOON ($ttl sec)"; break }
                default { "Active ($ttl sec)" }
            }
            
            $color = switch ([int]$ttl) {
                -2 { "Red"; break }
                -1 { "Yellow"; break }
                { $_ -le 5 } { "Red"; break }
                default { "Green" }
            }
            
            Write-Host "$key -> $status" -ForegroundColor $color
            
            # Get cart content if key exists (TTL != -2)
            if ([int]$ttl -ne -2) {
                try {
                    $cartContent = docker exec redis redis-cli GET $key 2>$null
                    if ($cartContent) {
                        # Try to parse as JSON to show structured data
                        try {
                            $cartJson = $cartContent | ConvertFrom-Json
                            
                            Write-Host "    User ID: $($cartJson.userId)" -ForegroundColor Cyan
                            Write-Host "    Last Updated: $($cartJson.lastUpdated)" -ForegroundColor Cyan
       
                            # Check if items is an object/hashtable with actual products
                            if ($cartJson.items) {
                                # Get the actual properties/keys of the items object
                                $itemProperties = $cartJson.items | Get-Member -MemberType NoteProperty
                                
                                if ($itemProperties -and $itemProperties.Count -gt 0) {
                                    # Filter out system properties that aren't actual products
                                    $actualItems = $itemProperties | Where-Object { 
                                        $_.Name -notin @('Count', 'Length', 'LongLength', 'Rank', 'SyncRoot', 'IsReadOnly', 'IsFixedSize', 'IsSynchronized') 
                                    }
                                    
                                    if ($actualItems -and $actualItems.Count -gt 0) {
                                        Write-Host "   Items ($($actualItems.Count)):" -ForegroundColor Magenta
                                        $actualItems | ForEach-Object {
                                            $productId = $_.Name
                                            $item = $cartJson.items.$productId
                                            Write-Host "      Product: $productId" -ForegroundColor White
                                            if ($item.quantity) {
                                                Write-Host "        Quantity: $($item.quantity)" -ForegroundColor Gray
                                            }
                                            if ($item.price) {
                                                Write-Host "        Price: $($item.price)" -ForegroundColor Gray
                                            }
                                            if ($item.addedAt) {
                                                Write-Host "        Added: $($item.addedAt)" -ForegroundColor Gray
                                            }
                                        }
                                    } else {
                                        Write-Host "  Cart is empty" -ForegroundColor Gray
                                    }
                                } else {
                                    Write-Host "  Cart is empty" -ForegroundColor Gray
                                }
                            } else {
                                Write-Host "  Cart is empty" -ForegroundColor Gray
                            }
                        }
                        catch {
                            # If JSON parsing fails, show raw content (truncated)
                            $truncated = if ($cartContent.Length -gt 100) { $cartContent.Substring(0, 100) + "..." } else { $cartContent }
                            Write-Host "   Raw Content: $truncated" -ForegroundColor Gray
                        }
                    } else {
                        Write-Host "    No content found" -ForegroundColor Yellow
                    }
                }
                catch {
                    Write-Host "   Error reading cart content: $($_.Exception.Message)" -ForegroundColor Red
                }
            }
            
            Write-Host ""
        }
    } else {
        Write-Host "No cart keys found" -ForegroundColor Yellow
    }
    
    Start-Sleep 2
}