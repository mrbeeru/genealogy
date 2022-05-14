using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System.Text.Json.Serialization;

namespace Genealogy.DataAccess.Entities
{
    [BsonCollection("persons")]
    public class PersonEntity : EntityBase
    {
        public string ProjectId { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Gender { get; set; }
        public MyDateOnly BirthDate { get; set; }
        public MyDateOnly? DeathDate { get; set; } = null;

        public string MotherId { get; set; }
        public string FatherId { get; set; }
        public IEnumerable<string> SpouseIds { get; set; }
        public IEnumerable<string> ChildrenIds { get; set; }  
    }
}
