import icons from '../icons';

export default {
    trashTypes: new Map([
        ['trash', {title: 'Trash', value: 'trash'}],
        ['recycling', {title: 'Recycling', value: 'recycling'}],
        ['other', {title: 'Other', value: 'other'}],
        ['bottles', {title: 'Bottles', value: 'bottles'}],
        ['straws', {title: 'Straws', value: 'straws'}],
        ['plastic_bags', {title: 'Plastic Bags', value: 'plastic_bags'}],
        ['cigarette_butts', {title: 'Cigarette Butts', value: 'cigarette_butts'}],
        ['needles', {title: 'Needles', value: 'needles'}],
        ['glass', {title: 'Glass', value: 'glass'}],
        ['dog_poop', {title: 'Dog Poop', value: 'dog_poop'}],
        ['invasive_plants', {title: 'Invasive Plants', value: 'invasive_plants'}],
        ['standing_water', {title: 'Standing Water', value: 'standing_water', icon: ''}],
    ]),

    activities: new Map([
        ['walking', {title: 'Walking', icon: icons.Walk}],
        ['running', {title: 'Running', icon: icons.Running}],
        ['hiking', {title: 'Hiking', icon: icons.Backpacker}],
        ['biking', {title: 'Biking', icon: icons.Bike}],
        ['swimming', {title: 'Swimming', icon: icons.Swimmer}],
        ['canoeing', {title: 'Canoeing', icon: icons.Canoe}]
    ]),

    groups: new Map([
        ['alone', {title: 'I was alone', icon: icons.Walk}],
        ['dog', {title: 'My dog', icon: icons.Dog}],
        ['teacher', {title: 'A child', icon: icons.Teacher}],
        ['friend', {title: 'A friend', icon: icons.Couple}],
        ['team', {title: 'A team', icon: icons.Team}]
    ])
};
