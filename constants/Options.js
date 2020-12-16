import icons from '../icons';

export default {
  trashTypes: new Map([
    ['trash', {title: 'Trash', value: 'trash'}],
    ['recycling', {title: 'Recycling', value: 'recycling'}],
    ['bottles', {title: 'Bottles', value: 'bottles'}],
    ['straws', {title: 'Straws', value: 'straws'}],
    ['plastic_bags', {title: 'Plastic Bags', value: 'plastic_bags'}],
    ['cigarette_butts', {title: 'Cigarette Butts', value: 'cigarette_butts'}],
    ['needles', {title: 'Metal/Junk', value: 'needles'}],
    ['glass', {title: 'Glass', value: 'glass'}],
    ['dog_poop', {title: 'Dog Poop', value: 'dog_poop'}],
    ['invasive_plants', {title: 'Invasive Plants', value: 'invasive_plants'}],
    ['standing_water', {title: 'Standing Water', value: 'standing_water', icon: ''}],

    ['other', {title: 'Other', value: 'other'}]
  ]),

  activities: new Map([
    ['walking', {title: 'Walking', icon: icons.Walk}],
    ['running', {title: 'Jogging', icon: icons.Running}],
    ['hiking', {title: 'Hiking', icon: icons.Backpacker}],
    ['biking', {title: 'Biking', icon: icons.Bike}],
    ['swimming', {title: 'On the Beach', icon: icons.Swimmer}],
    ['canoeing', {title: 'Paddling', icon: icons.Canoe}],
    ['horseback_riding', {title: 'Horseback Riding', icon: icons.Horseriding}],
    ['motorbiking', {title: 'Motorbiking', icon: icons.Motorbiking}],
    ['driving', {title: 'Driving', icon: icons.Driving}],
    ['winter_sports', {title: 'Winter Sports', icon: icons.WinterSports}]
  ]),

  groups: new Map([
    ['alone', {title: 'I was alone.', icon: icons.Walk}],
    ['dog', {title: 'My dog(s) cheered me on.', icon: icons.Dog}],
    ['teacher', {title: 'Kid plogger(s).', icon: icons.Teacher}],
    ['friend', {title: 'A friend or partner.', icon: icons.Couple}],
    ['team', {title: 'It was a group effort.', icon: icons.Team}],
    ['cat', {title: 'My cat(s) watched.', icon: icons.Cat}]
  ]),

  plogPhotoWidth: 500,
  plogPhotoHeight: 500,
  profilePhotoWidth: 500,
  profilePhotoHeight: 500,
};
