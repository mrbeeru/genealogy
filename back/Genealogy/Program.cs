using Genealogy;
using Genealogy.DataAccess.Repositories;
using Microsoft.Extensions.Options;
using MongoDB.Driver;

var builder = WebApplication.CreateBuilder(args);

//settings
builder.Services.Configure<MongoDbSettings>(builder.Configuration.GetSection("MongoDbSettings"));
builder.Services.AddSingleton(provider => provider.GetRequiredService<IOptions<MongoDbSettings>>().Value);

//add mongo
builder.Services.AddSingleton<IMongoClient>(c => new MongoClient(c.GetService<IOptions<MongoDbSettings>>().Value.ConnectionString));
builder.Services.AddScoped(c => c.GetService<IMongoClient>().StartSession());

builder.Services.AddScoped<IPersonRepository, PersonRepository>();
builder.Services.AddScoped<IProjectRepository, ProjectRepository>();
// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors(policy => policy.AllowAnyMethod().AllowAnyOrigin().AllowAnyHeader());

app.UseAuthorization();

app.MapControllers();

app.Run();
