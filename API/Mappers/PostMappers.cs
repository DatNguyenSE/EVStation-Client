using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.DTOs.ChargingPost;
using API.Entities;

namespace API.Mappers
{
    public static class PostMappers
    {
        public static ChargingPostDto ToPostDto(this ChargingPost postModel)
        {
            return new ChargingPostDto
            {
                Id = postModel.Id,
                Code = postModel.Code,
                Type = postModel.Type,
                PowerKW = postModel.PowerKW,
                ConnectorType = postModel.ConnectorType,
                Status = postModel.Status,
                QRCodeUrl = postModel.QRCode != null ? Convert.ToBase64String(postModel.QRCode) : null
            };
        }

        public static ChargingPost ToChargingPostFromCreateDto(this CreateChargingPostDto postDto)
        {
            return new ChargingPost
            {
                Type = postDto.Type,
                PowerKW = postDto.PowerKW,
                ConnectorType = postDto.ConnectorType,
                Status = postDto.Status
            };
        }
    }
}