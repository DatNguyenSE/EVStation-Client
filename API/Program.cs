using Microsoft.EntityFrameworkCore;
using API.Data;
using API.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.CodeAnalysis.Options;
using Microsoft.IdentityModel.Tokens;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using API.Interfaces;
using API.Services;
using API.Repository;
using Microsoft.OpenApi.Models;
using System.Security.Claims;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();

// swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddSwaggerGen(option =>
{
    option.SwaggerDoc("v1", new OpenApiInfo { Title = "Demo API", Version = "v1" });
    option.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        In = ParameterLocation.Header,
        Description = "Please enter a valid token",
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        BearerFormat = "JWT",
        Scheme = "Bearer"
    });
    option.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type=ReferenceType.SecurityScheme,
                    Id="Bearer"
                }
            },
            new string[]{}
        }
    });
});

builder.Services.AddControllers().AddNewtonsoftJson(option =>
{
    option.SerializerSettings.ReferenceLoopHandling = Newtonsoft.Json.ReferenceLoopHandling.Ignore;
});

builder.Services.AddDbContext<AppDbContext>(opt =>
{
    opt.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"));
}); // connect with sql server

builder.Services.AddCors();     //allow client connect to API

// config for password
builder.Services.AddIdentity<AppUser, IdentityRole>(options =>
{
    options.Password.RequireDigit = true;
    options.Password.RequireLowercase = true;
    options.Password.RequireUppercase = true;
    options.Password.RequireNonAlphanumeric = true;
    options.Password.RequiredLength = 12;
})
.AddEntityFrameworkStores<AppDbContext>();

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme =
    options.DefaultChallengeScheme =
    options.DefaultForbidScheme =
    options.DefaultScheme =
    options.DefaultSignInScheme =
    options.DefaultSignOutScheme = JwtBearerDefaults.AuthenticationScheme;
}).AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidateAudience = true,
        ValidAudience = builder.Configuration["Jwt:Audience"],
        ValidateIssuerSigningKey = true,
        RoleClaimType = ClaimTypes.Role,
        IssuerSigningKey = new SymmetricSecurityKey(
            System.Text.Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"])
        ),
    };
});

builder.Services.AddScoped<IVehicleRepository, VehicleRepository>();
builder.Services.AddScoped<ITokenService, TokenService>();
builder.Services.AddScoped<IStationRepository, StationRepository>();
builder.Services.AddScoped<IPostRepository, PostRepository>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors(x => x.AllowAnyHeader().AllowAnyMethod()
.WithOrigins("http://localhost:4200", "https://localhost:4200")); //set connect


app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();


//file này là file quan trọng, vì nó đăng kí cấu hình, controller, csdl,...