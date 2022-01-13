using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Genealogy.DataAccess.Entities
{
    public class EntityBase
    {
        [BsonId]
        public string Id { get; set; }
    }
}
