import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TlacuServices } from 'src/app/services/index';
import { Component } from '@angular/core';

import {
  Store,
  Address,
  UserAddress,
  AddressEnum,
  StateEnum,
  CityEnum,
  SuburbEnum
} from 'src/app/models/index';

import {
  FormGroup,
  FormControl,
  Validators
} from '@angular/forms';

@Component({
  selector: 'app-create-address',
  templateUrl: './create-address.component.html',
  styleUrls: ['./create-address.component.css']
})
export class CreateAddressComponent {

  postalCode: number;
  stateArray: StateEnum[];
  cityArray: CityEnum[];
  suburbArray: SuburbEnum[];

  form: FormGroup;

  get streetForm() {
    return this.form.get('street');
  }

  get stateForm() {
    return this.form.get('state');
  }

  get cityForm() {
    return this.form.get('city');
  }

  get suburbForm() {
    return this.form.get('suburb');
  }

  get postalCodeForm() {
    return this.form.get('postalCode');
  }

  constructor(
    public activeModal: NgbActiveModal,
    private tlacu: TlacuServices
  ) {
    this.stateArray = new Array();
    this.cityArray = new Array();
    this.suburbArray = new Array();
    this.postalCode = null;

    this.form = new FormGroup({
      street: new FormControl('', [Validators.required, Validators.minLength(3)]),
      state: new FormControl('', Validators.required),
      city: new FormControl('', Validators.required),
      suburb: new FormControl('', Validators.required)
    });

    this.getStates();
    this.getCities();
    this.onChanges();
  }

  /**
   * Monitors for changes in the form group controls and updates
   * corresponding arrays.
   */
  onChanges() {
    this.cityForm.valueChanges.subscribe(newCity => {
      this.postalCode = null;
      this.getSuburbs(newCity);
    });

    this.suburbForm.valueChanges.subscribe(newSuburb => {
      this.getPostalCode(newSuburb);
    });
  }

  /**
   * Get all states from database and stores them in the stateArray
   * as StateEnum objects. Since only Morelos is in the database, only
   * store the first result in the recordset.
   */
  getStates() {
    this.tlacu.stateEnum.listStateEnum().subscribe(res => {
      this.stateArray.push(new StateEnum(res.recordset[0]));
    });
  }

  /**
   * Get all cities in the database and store them in the cityArray
   * as CityEnum objects. Since only Morelos is in the database, all
   * cities are Morelos' cities.
   */
  getCities() {
    this.tlacu.cityEnum.listCityEnum().subscribe(res => {
      if (res.length > 0) {
        res.recordset.forEach(city => {
          const c = new CityEnum(city);
          this.cityArray.push(c);
        });
      }
    });
  }

  /**
   * Get all suburbs for a given city and store them in the suburbArray
   * as SuburbEnum objects.
   *
   * @param idCityEnum a CityEnum.idCityEnum number, identifies a CityEnum
   * in the database.
   */
  getSuburbs(idCityEnum: number) {
    const suburbArrayTemp: SuburbEnum[] = new Array();
    this.tlacu.suburbEnum.listSuburbEnum(null, null, null, idCityEnum).subscribe(res => {
      if (res.length > 0) {
        res.recordset.forEach(suburb => {
          const s = new SuburbEnum(suburb);
          suburbArrayTemp.push(s);
        });
        this.suburbArray = suburbArrayTemp;
      }
    });

  }

  /**
   * Get the corresponding selected suburb complete object and store the
   * postal code.
   *
   * @param idSuburbEnum a SuburbEnum.idSuburbEnum number, identifies a
   * SuburbEnum in the database.
   */
  getPostalCode(idSuburbEnum: number) {
    this.tlacu.suburbEnum.getSuburbEnum(idSuburbEnum).subscribe(res => {
      const sub = new SuburbEnum(res.recordset[0]);
      this.postalCode = sub.postalCode;
    });
  }

  /**
   * Take the values from  this.form and use them to insert into the
   * database in order, satisfying table constraints.
   */
  submit() {
    console.log('Creating UserAddress.');
    console.log(this.form);

    if (!this.form.valid) {
      this.form.setErrors({
        invalidForm: true
      });
      return;
    }

    /* If this.form is valid, all form controls are valid and storable in the database. */
    if (this.postalCode != null) {
      this.createAddressEnum()
      .then(idAddressEnum => this.createAddress(idAddressEnum))
      .then(idAddress => this.createUserAddress(idAddress));
    }

    this.activeModal.close();
  }

  async createAddressEnum(): Promise<number> {
    /* Create AddresEnum object. */
    const addressEnum = new AddressEnum({address: this.streetForm.value });

    /**
     * Create this AddressEnum in the database and subscribe to handle the response.
     * Return inserted id in table AddressEnum.
     */
    this.tlacu.adressEnum.createAddressEnum(addressEnum).subscribe(response => {
      if (response.success) {
        const idAddressEnum: number = response.createdAddressEnum.insertId;
        return idAddressEnum;
      }
    });

    return null;
  }

  async createAddress(idAddressEnum: number): Promise<number> {
    /* create Address object. */
    const address = new Address({
      fkAddressEnum: idAddressEnum,
      fkStateEnum: this.stateForm.value,
      fkCityEnum: this.cityForm.value,
      fkSuburbEnum: this.suburbForm.value
    });

    /**
     * Create this Address in the database and subscribe to handle the response.
     * Return inserted id in table Address.
     */
    this.tlacu.address.createAddress(address).subscribe(response => {
      if (response.success) {
        const idAddress: number = response.createdAddress.insertId;
        return idAddress;
      }
    });

    return null;
  }

  async createUserAddress(idAddress: number) {
    /* Create UserAddress object. */
    const userAddress = new UserAddress({
      fkUser: this.tlacu.manager.user.idUser,
      fkAddress: idAddress
    });

    /**
     * Create this UserAddress in the database and subscribe to handle the response.
     */
    this.tlacu.userAddress.createUserAddress(userAddress).subscribe(response => {
      if (response.success) {
        this.tlacu.manager.updateUserAddress.next(1);
      }
    });
  }
}
