using System.Text.Json.Serialization;

namespace Genealogy.DataAccess.Entities
{
    [Flags]
    public enum Visibility
    {
        Unknown = 0,
        Private = 1,
        Visible = 2,
    }

    [BsonCollection("projects")]
    public class ProjectEntity : EntityBase
    {
        public string? Name { get; set; }
        public bool IsFeatured { get; set; }

        [JsonConverter(typeof(JsonStringEnumConverter))]
        public Visibility Visibility { get; set; }
    }
}
