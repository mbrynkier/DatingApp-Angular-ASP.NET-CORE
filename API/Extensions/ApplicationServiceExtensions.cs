using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.Data;
using API.Helpers;
using API.Interfaces;
using API.Services;
using API.SignalR;
using Microsoft.EntityFrameworkCore;

namespace API.Extensions
{
    public static class ApplicationServiceExtensions
    {
        public static IServiceCollection AddAplicationServices(this IServiceCollection services, IConfiguration config) //El this le agrega a ya existente service un metodo (Extending Methods)
        {
            services.AddSingleton<PresenceTracker>(); //Se agrego para SignalR
            services.Configure<CloudinarySettings>(config.GetSection("CloudinarySettings")); //Cloudinary Settings.cs
            services.AddScoped<IPhotoService, PhotoService>(); //Agregamos la interfaz y el service de las photos
            services.AddScoped<ITokenService, TokenService>(); //Agrega las interfaces y el token service            
            // services.AddScoped<IUserRepository, UserRepository>(); //Agrega el Repository
            services.AddScoped<LogUserActivity>(); //ESto es para actualizar la fecha de actividad LogUserActivity.cs
            // services.AddScoped<ILikesRepository, LikesRepository>(); //Repository de lso likes
            // services.AddScoped<IMessageRepository, MessageRepository>(); //Repository de los mensajes      
            services.AddScoped<IUnitOfWork, UnitOfWork>(); //se borraron los otros repository y se centralizo todo en eso.      
            services.AddAutoMapper(typeof(AutoMapperProfiles).Assembly); //Para mapear los Dto
            services.AddDbContext<DataContext>(options =>
            {
                options.UseSqlite(config.GetConnectionString("DefaultConnection"));
            });

            return services;
        }
    }
}