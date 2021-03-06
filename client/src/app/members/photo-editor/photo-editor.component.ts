import { Component, Input, OnInit } from '@angular/core';
import { FileUploader } from 'ng2-file-upload';
import { take } from 'rxjs/operators';
import { Member } from 'src/app/_models/member';
import { User } from 'src/app/_models/user';
import { Photo } from 'src/app/_models/photo';
import { AccountService } from 'src/app/_services/account.service';
import { MembersService } from 'src/app/_services/members.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-photo-editor',
  templateUrl: './photo-editor.component.html',
  styleUrls: ['./photo-editor.component.css']
})
export class PhotoEditorComponent implements OnInit {
  @Input() member: Member;
  uploader: FileUploader;
  hasBaseDropzoneOver = false;
  baseUrl = environment.apiUrl;
  user: User;

  constructor(private accountService:AccountService, private memberService:MembersService) { 
    this.accountService.currentUser$.pipe(take(1)).subscribe(user =>this.user = user)
  }

  ngOnInit(): void {
    this.initializeUploader();
  }

  fileOverBase(e:any){
    this.hasBaseDropzoneOver = e;
  }

  setMainPhoto(photo: Photo){
    //llamo al servicio de setMainPhoto
    this.memberService.setMainPhoto(photo.id).subscribe(() => {
      this.user.photoUrl = photo.url; //seteo la foto, la foto que elegi. Asi lo muestra en tiempo real
      this.accountService.setCurrentUser(this.user); //Guarda el user con la foto ya con el main
      this.member.photoUrl = photo.url; //guarda la url en la de member.
      this.member.photos.forEach(p => { //se fija en el member y actualiza la foto que es main y la que es false.
        if(p.isMain) p.isMain = false;
        if(p.id === photo.id) p.isMain = true;
      })
    });
  }

  deletePhoto(photoId:number){
    //llamo al servicio de deletePhoto
    this.memberService.deletePhoto(photoId).subscribe(() =>{
      this.member.photos = this.member.photos.filter(x => x.id !== photoId); //Guardo todas las fotos menos la que fue borrada.
    })
  }

  //Se instalo el FileUploader se puso en el shared.module.ts
  initializeUploader(){
    this.uploader = new FileUploader({
      url: this.baseUrl + 'users/add-photo',
      authToken: 'Bearer ' + this.user.token,
      isHTML5: true,
      allowedFileType: ['image'],
      removeAfterUpload: true,
      autoUpload: false,
      maxFileSize: 10* 1024 * 1024
    });

    this.uploader.onAfterAddingFile = (file) =>{
      file.withCredentials = false;
    }

    this.uploader.onSuccessItem = (item,response,status,headers) =>{
      if (response) {
        const photo : Photo = JSON.parse(response);
        this.member.photos.push(photo);
        if(photo.isMain){
          this.user.photoUrl = photo.url;
          this.member.photoUrl = photo.url;
          this.accountService.setCurrentUser(this.user);
        }     
      }
    }
  }
}
