using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace API.Helpers
{
    public static class StationCodeHelper
    {
        // xóa các kí tự có dấu như Sài Gòn thành Sai Gon
        private static string RemoveDiacritics(string text)
        {
            if (string.IsNullOrWhiteSpace(text)) return string.Empty;
            var normalized = text.Normalize(NormalizationForm.FormD);
            var sb = new StringBuilder();
            foreach (var ch in normalized)
            {
                var uc = CharUnicodeInfo.GetUnicodeCategory(ch);
                if (uc != UnicodeCategory.NonSpacingMark)
                    sb.Append(ch);
            }
            return sb.ToString().Normalize(NormalizationForm.FormC);
        }

        // Mapping những tên thành phố/tỉnh mà muốn map "đặc biệt" 
        // như Vinh hay Sài Gòn đồ á
        // hàm này muốn thêm thì thêm
        private static readonly Dictionary<string, string> CityMapping = new(StringComparer.OrdinalIgnoreCase)
        {
            // normalized keys (no diacritics) -> chạy xóa dấu rồi nên key không có dấu luôn
            { "ho chi minh", "HCM" },
            { "saigon", "HCM" },
            { "hcm", "HCM" },
            { "ha noi", "HN" },
            { "hanoi", "HN" },
            { "vinh", "VI" },
            { "binh duong", "BD" },
            { "da nang", "DN" },
            // mở rộng thêm nếu cần...
        };

        public static string GenerateStationCode(string address, int stationId, int maxInitialLength = 3)
        {
            // Sanitize & normalize
            var addr = (address ?? string.Empty).Trim();
            var plain = RemoveDiacritics(addr).ToLowerInvariant();

            // 1. Lấy thằng sau dấu phẩy cuối cùng trong address (last segment thường là tỉnh/thành)
            string? stationPrefix = null;
            var segments = addr.Split(',', StringSplitOptions.RemoveEmptyEntries)
                            .Select(s => s.Trim()).Where(s => s.Length > 0).ToArray();
            if (segments.Length > 0)
            {
                var lastSeg = RemoveDiacritics(segments.Last()).ToLowerInvariant();
                foreach (var kv in CityMapping)
                {
                    if (lastSeg.Contains(kv.Key)) { stationPrefix = kv.Value; break; }
                }
            }

            // 2. Nếu không có thì thử tìm trong cái mapping
            if (stationPrefix == null)
            {
                foreach (var kv in CityMapping)
                {
                    if (plain.Contains(kv.Key))
                    {
                        stationPrefix = kv.Value;
                        break;
                    }
                }
            }

            // 3. Fallback: build initials from last words (try last two words then first words)
            if (stationPrefix == null)
            {
                // use the last segment (after commas) if exists, otherwise the whole address
                var segmentToUse = segments.Length > 0 ? segments.Last() : addr;
                // split into words (letters/numbers only)
                var words = Regex.Split(RemoveDiacritics(segmentToUse).Trim(), @"\s+")
                                .Where(w => !string.IsNullOrWhiteSpace(w))
                                .ToArray();
                if (words.Length == 0)
                {
                    stationPrefix = "STN";
                }
                else
                {
                    // take up to maxInitialLength initials: prefer last words (province name)
                    var initials = string.Concat(words.Select(w => w[0]).Take(maxInitialLength)).ToUpperInvariant();
                    if (initials.Length == 0) stationPrefix = "STN"; else stationPrefix = initials;
                }
            }

            // 4. Append thêm StationId trong database
            var paddedId = stationId.ToString("D2"); // D2 => 01, 02, 10, 100...
            var code = $"{stationPrefix}{paddedId}";

            // Clean up: remove spaces/illegal chars (shouldn't have any)
            code = Regex.Replace(code, @"\s+", string.Empty);
            return code;
        }
    }
}