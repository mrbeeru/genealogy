using Genealogy.DataAccess.Entities;
using Genealogy.Exceptions;
using MongoDB.Bson;
using MongoDB.Driver;

namespace Genealogy.DataAccess.Repositories
{
    public class RepositoryBase<T> : IRepositoryBase<T> where T : EntityBase
    {
        private const string DATABASE = "genealogyDB";
        private readonly IMongoClient mongoClient;
        protected readonly IClientSessionHandle clientSessionHandle;
        private readonly string collectionName;

        public RepositoryBase(IMongoClient mongoClient, IClientSessionHandle clientSessionHandle)
        {
            this.mongoClient = mongoClient;
            this.clientSessionHandle = clientSessionHandle;
            this.collectionName = (typeof(T).GetCustomAttributes(typeof(BsonCollectionAttribute), true).FirstOrDefault() as BsonCollectionAttribute).CollectionName;

            if (!mongoClient.GetDatabase(DATABASE).ListCollectionNames().ToList().Contains(collectionName))
                mongoClient.GetDatabase(DATABASE).CreateCollection(collectionName);

            Collection = mongoClient.GetDatabase(DATABASE).GetCollection<T>(collectionName);
        }

        public IMongoCollection<T> Collection { get; }

        public async Task InsertAsync(T obj) => await Collection.InsertOneAsync(clientSessionHandle, obj);
        public async Task DeleteAsync(string id) => await Collection.DeleteOneAsync(clientSessionHandle, f => f.Id == id);
        public async Task<T> FindByIdAsync(string id) => (await Collection.FindAsync(clientSessionHandle, f => f.Id == id)).SingleOrDefault() ?? throw new EntityNotFoundException($"Could not find result with id '{id}'");
        public async Task<IEnumerable<T>> FindAllAsync() => (await Collection.FindAsync(clientSessionHandle, _ => true)).ToList();
        public async Task<IEnumerable<T>> FindAsync(FilterDefinition<T> filter) => (await Collection.FindAsync(clientSessionHandle, filter)).ToList();

        public static FilterDefinition<T> BuildFilter(params (string key, string value)[] a)
        {
            List<FilterDefinition<T>> filters = new List<FilterDefinition<T>>();

            foreach (var item in a)
                filters.Add(Builders<T>.Filter.Eq(item.key, item.value));

            return Builders<T>.Filter.And(filters);
        }
    }
}
